declare module 'airport-codes' {
    const airportCodes: {
      findWhere(query: { iata: string }): { iata: string; name: string; country: string } | null;
      [key: string]: any; // Allow other dynamic properties
    };
    export default airportCodes;
  }