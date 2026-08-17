import type { City } from "@/types/location";

export const cities: City[] = [
  {
    id: "karachi",
    name: "Karachi",
    installationSupported: true,
    areas: ["Clifton", "Gulshan-e-Iqbal", "DHA", "North Nazimabad", "Saddar"],
  },
  {
    id: "lahore",
    name: "Lahore",
    installationSupported: true,
    areas: ["Gulberg", "DHA", "Johar Town", "Model Town", "Iqbal Town"],
  },
  {
    id: "islamabad",
    name: "Islamabad",
    installationSupported: true,
    areas: ["F-6", "F-7", "G-9", "I-8", "Bahria Town"],
  },
  {
    id: "rawalpindi",
    name: "Rawalpindi",
    installationSupported: true,
    areas: ["Saddar", "Satellite Town", "Bahria Town", "Chaklala"],
  },
  {
    id: "faisalabad",
    name: "Faisalabad",
    installationSupported: true,
    areas: ["Madina Town", "Peoples Colony", "Susan Road"],
  },
  {
    id: "multan",
    name: "Multan",
    installationSupported: false,
    areas: ["Cantt", "Gulgasht Colony", "Shah Rukn-e-Alam"],
  },
  {
    id: "peshawar",
    name: "Peshawar",
    installationSupported: false,
    areas: ["University Town", "Hayatabad", "Saddar"],
  },
  {
    id: "quetta",
    name: "Quetta",
    installationSupported: false,
    areas: ["Cantt", "Jinnah Town"],
  },
  {
    id: "hyderabad",
    name: "Hyderabad",
    installationSupported: false,
    areas: ["Latifabad", "Qasimabad"],
  },
  {
    id: "sialkot",
    name: "Sialkot",
    installationSupported: false,
    areas: ["Cantt", "Model Town"],
  },
];