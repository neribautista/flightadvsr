import React, { useEffect, useRef, useState } from 'react';
import { Animated, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTrip } from '../../context/TripContenxt';
import { buildJourneyResult } from '../../services/journeyService';

const BLUE='#2478f3', NAVY='#102747', MUTED='#61718a', GREEN='#34b862';
const wait=(ms:number)=>new Promise(r=>setTimeout(r,ms));
const STEP_MS=300; // pacing of each checklist tick while the search runs
const DONE_MS=150; // pause on "10 of 10" before redirecting

export default function AnalyzingScreen(){
  const {travelerData,tripDetails,preferences,analysisSteps,setAnalysisSteps,setResult,resetAnalysis}=useTrip();
  const [message,setMessage]=useState('Preparing your personalized search...');
  const [error,setError]=useState('');
  const pulse=useRef(new Animated.Value(.9)).current;
  useEffect(()=>{ const loop=Animated.loop(Animated.sequence([Animated.timing(pulse,{toValue:1,duration:700,useNativeDriver:true}),Animated.timing(pulse,{toValue:.9,duration:700,useNativeDriver:true})])); loop.start(); return()=>loop.stop();},[pulse]);
  useEffect(()=>{ let cancelled=false; (async()=>{
    resetAnalysis();
    const steps=analysisSteps;
    const setStatus=(ids:string[],status:'active'|'completed'|'error')=>setAnalysisSteps(c=>c.map(x=>ids.includes(x.id)?{...x,status}:x));
    // Start the live search straight away so the checklist reflects real work
    // instead of finishing before the request has even been sent.
    let finished=false;
    const search=buildJourneyResult(travelerData,tripDetails,preferences).finally(()=>{finished=true;});
    search.catch(()=>{});
    try{
      // Tick through every step except the last while the search runs.
      for(const step of steps.slice(0,-1)){
        if(cancelled)return;
        if(finished)break;
        setMessage(step.label); setStatus([step.id],'active');
        await wait(STEP_MS);
        setStatus([step.id],'completed');
      }
      // The final step stays active until the live results are back.
      const last=steps[steps.length-1];
      if(!finished){ setMessage('Loading live fares and building your recommendation...'); setStatus([last.id],'active'); }
      const result=await search;
      if(cancelled)return;
      setResult(result);
      setStatus(steps.map(s=>s.id),'completed');
      setMessage('Your journey recommendation is ready.');
      // Short beat so "10 of 10" is visible, then go straight to results.
      await wait(DONE_MS);
      if(!cancelled) router.replace('/onboarding/results');
    }catch(e){ if(cancelled)return; const text=e instanceof Error?e.message:'Unable to complete the search.'; setError(text); setMessage('We could not prepare this journey.'); setAnalysisSteps(c=>c.map(x=>x.status==='active'?{...x,status:'error'}:x)); }
  })(); return()=>{cancelled=true};},[]);
  const completed=analysisSteps.filter(s=>s.status==='completed').length;
  return <SafeAreaView style={styles.safe}><View style={styles.page}><Animated.View style={[styles.icon,{transform:[{scale:pulse}]}]}><Ionicons name="sparkles" size={32} color={BLUE}/></Animated.View><Text style={styles.title}>Analyzing your journey</Text><Text style={styles.body}>{message}</Text><View style={styles.card}>{analysisSteps.map(step=><View key={step.id} style={styles.row}><Ionicons name={step.status==='completed'?'checkmark-circle':step.status==='error'?'alert-circle':step.status==='active'?'sync-circle':'ellipse-outline'} size={20} color={step.status==='completed'?GREEN:step.status==='error'?'#d64545':step.status==='active'?BLUE:'#a8b4c4'}/><Text style={styles.label}>{step.label}</Text></View>)}</View><Text style={styles.progress}>{completed} of {analysisSteps.length} checks complete</Text>{error?<Text style={styles.error}>{error}</Text>:null}</View></SafeAreaView>;
}
const styles=StyleSheet.create({safe:{flex:1,backgroundColor:'#f8fbff'},page:{flex:1,alignItems:'center',justifyContent:'center',padding:24},icon:{width:76,height:76,borderRadius:38,backgroundColor:'#e9f2ff',alignItems:'center',justifyContent:'center'},title:{fontSize:30,fontWeight:'800',color:NAVY,marginTop:18},body:{fontSize:15,color:MUTED,textAlign:'center',marginTop:8,maxWidth:520},card:{width:'100%',maxWidth:620,backgroundColor:'#fff',borderRadius:20,padding:22,marginTop:24,shadowColor:'#000',shadowOpacity:.06,shadowRadius:20,elevation:3},row:{flexDirection:'row',alignItems:'center',gap:12,paddingVertical:9},label:{fontSize:15,color:NAVY,flex:1},progress:{marginTop:16,color:MUTED},error:{marginTop:12,color:'#b42318',textAlign:'center',maxWidth:620}});
