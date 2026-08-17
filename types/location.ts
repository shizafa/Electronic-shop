// A serviceable city, its delivery areas, and whether installation service is offered there
export interface City {
  id: string;
  name: string;
  installationSupported: boolean;
  areas: string[];
}