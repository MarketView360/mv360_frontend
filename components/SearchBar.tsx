"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Clock, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

/* ------------------------------------------------------------------ */
/* Types                                                              */
/* ------------------------------------------------------------------ */
type RecentItem = { ticker: string; name: string; timestamp: number };

/* ------------------------------------------------------------------ */
/* Constants                                                          */
/* ------------------------------------------------------------------ */
const MAX_RECENTS = 5;
const SEARCH_DEBOUNCE_MS = 300;

/* ------------------------------------------------------------------ */
/* Hooks                                                              */
/* ------------------------------------------------------------------ */
function useLocalStorage<T>(key: string, fallback: T) {
  const [value, setValue] = useState<T>(fallback);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(key);
      if (raw) setValue(JSON.parse(raw));
    } catch {
      /* ignore malformed JSON */
    }
  }, [key]);

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const nextValue = typeof next === "function" ? (next as (p: T) => T)(prev) : next;
        window.localStorage.setItem(key, JSON.stringify(nextValue));
        return nextValue;
      });
    },
    [key]
  );

  return [value, update] as const;
}

/* ------------------------------------------------------------------ */
/* Auto-complete mock                                                 */
/* ------------------------------------------------------------------ */
const POPULAR_TICKERS: Record<string, string> = {
  AAPL: "Apple Inc.",
  MSFT: "Microsoft Corporation",
  GOOGL: "Alphabet Inc. Class A",
  GOOG: "Alphabet Inc. Class C",
  AMZN: "Amazon.com Inc.",
  TSLA: "Tesla Inc.",
  NVDA: "NVIDIA Corporation",
  META: "Meta Platforms Inc.",
  NFLX: "Netflix Inc.",
  JPM: "JPMorgan Chase & Co.",
  V: "Visa Inc.",
  JNJ: "Johnson & Johnson",
  WMT: "Walmart Inc.",
  PG: "Procter & Gamble Co.",
  MA: "Mastercard Incorporated",
  HD: "The Home Depot Inc.",
  PFE: "Pfizer Inc.",
  COST: "Costco Wholesale Corporation",
  MCD: "McDonald's Corporation",
  ABBV: "AbbVie Inc.",
  CSCO: "Cisco Systems Inc.",
  TMO: "Thermo Fisher Scientific Inc.",
  ABT: "Abbott Laboratories",
  ACN: "Accenture plc",
  ADBE: "Adobe Inc.",
  AMD: "Advanced Micro Devices Inc.",
  AMGN: "Amgen Inc.",
  AVGO: "Broadcom Inc.",
  BAC: "Bank of America Corporation",
  BMY: "Bristol-Myers Squibb Company",
  CMCSA: "Comcast Corporation",
  CRM: "Salesforce Inc.",
  CVX: "Chevron Corporation",
  DHR: "Danaher Corporation",
  DIS: "The Walt Disney Company",
  F: "Ford Motor Company",
  GE: "General Electric Company",
  INTC: "Intel Corporation",
  KO: "The Coca-Cola Company",
  LIN: "Linde plc",
  LLY: "Eli Lilly and Company",
  MRNA: "Moderna Inc.",
  MRK: "Merck & Co. Inc.",
  NKE: "NIKE Inc.",
  ORCL: "Oracle Corporation",
  PYPL: "PayPal Holdings Inc.",
  SBUX: "Starbucks Corporation",
  T: "AT&T Inc.",
  TXN: "Texas Instruments Incorporated",
  UNH: "UnitedHealth Group Incorporated",
  VZ: "Verizon Communications Inc.",
  WFC: "Wells Fargo & Company",
  XOM: "Exxon Mobil Corporation",
  ADI: "Analog Devices Inc.",
  ADP: "Automatic Data Processing Inc.",
  AEP: "American Electric Power Company Inc.",
  AFL: "Aflac Incorporated",
  AIG: "American International Group Inc.",
  AIT: "Applied Industrial Technologies Inc.",
  AIZ: "Assurant Inc.",
  AJG: "Arthur J. Gallagher & Co.",
  AKAM: "Akamai Technologies Inc.",
  ALGN: "Align Technology Inc.",
  ALK: "Alaska Air Group Inc.",
  ALL: "Allstate Corporation",
  ALLE: "Allegion plc",
  AMAT: "Applied Materials Inc.",
  AMCR: "Amcor plc",
  AME: "Ametek Inc.",
  AMP: "Ameriprise Financial Inc.",
  AMT: "American Tower Corporation",
  ANET: "Arista Networks Inc.",
  ANSS: "Ansys Inc.",
  AON: "Aon plc",
  AOS: "A. O. Smith Corporation",
  APA: "APA Corporation",
  APD: "Air Products and Chemicals Inc.",
  APH: "Amphenol Corporation",
  APTV: "Aptiv plc",
  ARE: "Alexandria Real Estate Equities Inc.",
  ASML: "ASML Holding N.V.",
  ATVI: "Activision Blizzard Inc.",
  AVB: "AvalonBay Communities Inc.",
  AVY: "Avery Dennison Corporation",
  AWK: "American Water Works Company Inc.",
  AXP: "American Express Company",
  AYI: "Acuity Brands Inc.",
  AZO: "AutoZone Inc.",
  BA: "Boeing Company",
  BABA: "Alibaba Group Holding Limited",
  BAX: "Baxter International Inc.",
  BBWI: "Bath & Body Works Inc.",
  BBY: "Best Buy Co. Inc.",
  BD: "Becton Dickinson and Company",
  BDX: "Becton Dickinson and Company",
  BEN: "Franklin Resources Inc.",
  BG: "Bunge Limited",
  BIDU: "Baidu Inc.",
  BIO: "Bio-Rad Laboratories Inc.",
  BK: "The Bank of New York Mellon Corporation",
  BKNG: "Booking Holdings Inc.",
  BLK: "BlackRock Inc.",
  BM: "Biomerica Inc.",
  BR: "Broadridge Financial Solutions Inc.",
  BROS: "Dutch Bros Inc.",
  BSX: "Boston Scientific Corporation",
  BWA: "BorgWarner Inc.",
  BXP: "Boston Properties Inc.",
  C: "Citigroup Inc.",
  CAH: "Cardinal Health Inc.",
  CARR: "Carrier Global Corporation",
  CAT: "Caterpillar Inc.",
  CB: "Chubb Limited",
  CBRE: "CBRE Group Inc.",
  CC: "The Chemours Company",
  CCI: "Crown Castle International Corp.",
  CCL: "Carnival Corporation & plc",
  CDAY: "Ceridian HCM Holding Inc.",
  CDNS: "Cadence Design Systems Inc.",
  CDW: "CDW Corporation",
  CE: "Celanese Corporation",
  CEG: "Constellation Energy Corporation",
  CF: "CF Industries Holdings Inc.",
  CFG: "Citizens Financial Group Inc.",
  CHD: "Church & Dwight Co. Inc.",
  CHIR: "Cosmetic Healthcare Group Inc.",
  CHRW: "C.H. Robinson Worldwide Inc.",
  CHTR: "Charter Communications Inc.",
  CI: "The Cigna Group",
  CINF: "Cincinnati Financial Corporation",
  CL: "Colgate-Palmolive Company",
  CLX: "The Clorox Company",
  CMA: "Comerica Incorporated",
  CME: "CME Group Inc.",
  CMS: "CMS Energy Corporation",
  CNC: "Centene Corporation",
  CNP: "CenterPoint Energy Inc.",
  CNX: "CNX Resources Corporation",
  COF: "Capital One Financial Corporation",
  COO: "The Cooper Companies Inc.",
  COP: "ConocoPhillips",
  CPAY: "Corpay Inc.",
  CPB: "Campbell Soup Company",
  CPRT: "Copart Inc.",
  CPT: "Camden Property Trust",
  CRDA: "Crawford & Company",
  CRK: "Comstock Resources Inc.",
  CSL: "Carlisle Companies Incorporated",
  CSX: "CSX Corporation",
  CTAS: "Cintas Corporation",
  CTLT: "Catalent Inc.",
  CTOS: "Custom Truck One Source Inc.",
  CTRN: "Citi Trends Inc.",
  CTSH: "Cognizant Technology Solutions Corporation",
  CUBE: "CubeSmart",
  CUK: "Carnival Corporation & plc",
  CVAC: "CureVac N.V.",
  CVE: "Cenovus Energy Inc.",
  CVS: "CVS Health Corporation",
  CZR: "Caesars Entertainment Inc.",
  D: "Dominion Energy Inc.",
  DAL: "Delta Air Lines Inc.",
  DAN: "Dana Incorporated",
  DASH: "DoorDash Inc.",
  DCI: "Donaldson Company Inc.",
  DD: "DuPont de Nemours Inc.",
  DDOG: "Datadog Inc.",
  DE: "Deere & Company",
  DFS: "Discover Financial Services",
  DG: "Dollar General Corporation",
  DGX: "Quest Diagnostics Incorporated",
  DHI: "D.R. Horton Inc.",
  DISH: "DISH Network Corporation",
  DLR: "Digital Realty Trust Inc.",
  DLTR: "Dollar Tree Inc.",
  DNB: "Dun & Bradstreet Holdings Inc.",
  DOCU: "DocuSign Inc.",
  DOV: "Dover Corporation",
  DOW: "Dow Inc.",
  DPZ: "Domino's Pizza Inc.",
  DRI: "Darden Restaurants Inc.",
  DTE: "DTE Energy Company",
  DUK: "Duke Energy Corporation",
  DVA: "DaVita Inc.",
  DVN: "Devon Energy Corporation",
  DXC: "DXC Technology Company",
  DXCM: "DexCom Inc.",
  EA: "Electronic Arts Inc.",
  EBAY: "eBay Inc.",
  ECL: "Ecolab Inc.",
  ED: "Consolidated Edison Inc.",
  EFX: "Equifax Inc.",
  EIX: "Edison International",
  EL: "The Estée Lauder Companies Inc.",
  EMN: "Eastman Chemical Company",
  EMR: "Emerson Electric Co.",
  ENLC: "EnLink Midstream LLC",
  ENPH: "Enphase Energy Inc.",
  EOG: "EOG Resources Inc.",
  EPAM: "EPAM Systems Inc.",
  EQIX: "Equinix Inc.",
  EQNR: "Equinor ASA",
  EQT: "EQT Corporation",
  ES: "Eversource Energy",
  ESS: "Essex Property Trust Inc.",
  ET: "Energy Transfer LP",
  ETN: "Eaton Corporation plc",
  ETR: "Entergy Corporation",
  ETSY: "Etsy Inc.",
  EV: "Eaton Vance Corporation",
  EVR: "Evercore Inc.",
  EW: "Edwards Lifesciences Corporation",
  EXC: "Exelon Corporation",
  EXPD: "Expeditors International of Washington Inc.",
  EXPE: "Expedia Group Inc.",
  EXR: "Extra Space Storage Inc.",
  FANG: "Diamondback Energy Inc.",
  FAST: "Fastenal Company",
  FBHS: "Fortune Brands Home & Security Inc.",
  FCX: "Freeport-McMoRan Inc.",
  FDS: "FactSet Research Systems Inc.",
  FDX: "FedEx Corporation",
  FE: "FirstEnergy Corp.",
  FFIV: "F5 Inc.",
  FHB: "First Hawaiian Inc.",
  FIS: "Fidelity National Information Services Inc.",
  FISV: "Fiserv Inc.",
  FITB: "Fifth Third Bancorp",
  FL: "Foot Locker Inc.",
  FLEX: "Flex Ltd.",
  FMC: "FMC Corporation",
  FOX: "Fox Corporation Class B",
  FOXA: "Fox Corporation Class A",
  FRC: "First Republic Bank",
  FRT: "Federal Realty Investment Trust",
  FSLR: "First Solar Inc.",
  FTI: "TechnipFMC plc",
  FTNT: "Fortinet Inc.",
  FTV: "Fortive Corporation",
  GDDY: "GoDaddy Inc.",
  GD: "General Dynamics Corporation",
  GHC: "Graham Holdings Company",
  GILD: "Gilead Sciences Inc.",
  GIS: "General Mills Inc.",
  GL: "Globe Life Inc.",
  GLW: "Corning Incorporated",
  GM: "General Motors Company",
  GME: "GameStop Corp.",
  GNRC: "Generac Holdings Inc.",
  GPC: "Genuine Parts Company",
  GPN: "Global Payments Inc.",
  GPS: "Gap Inc.",
  GRMN: "Garmin Ltd.",
  GS: "The Goldman Sachs Group Inc.",
  GWW: "W.W. Grainger Inc.",
  HAL: "Halliburton Company",
  HAS: "Hasbro Inc.",
  HBAN: "Huntington Bancshares Incorporated",
  HCA: "HCA Healthcare Inc.",
  HES: "Hess Corporation",
  HIG: "The Hartford Financial Services Group Inc.",
  HII: "Huntington Ingalls Industries Inc.",
  HLT: "Hilton Worldwide Holdings Inc.",
  HOLX: "Hologic Inc.",
  HON: "Honeywell International Inc.",
  HP: "Helmerich & Payne Inc.",
  HPE: "Hewlett Packard Enterprise Company",
  HPQ: "HP Inc.",
  HRB: "H&R Block Inc.",
  HRL: "Hormel Foods Corporation",
  HSBC: "HSBC Holdings plc",
  HST: "Host Hotels & Resorts Inc.",
  HSY: "The Hershey Company",
  HTHT: "Huazhu Group Limited",
  HTZ: "Hertz Global Holdings Inc.",
  HUM: "Humana Inc.",
  HUN: "Huntsman Corporation",
  IAC: "IAC/InterActiveCorp",
  IBM: "International Business Machines Corporation",
  ICE: "Intercontinental Exchange Inc.",
  IDXX: "IDEXX Laboratories Inc.",
  IEX: "IDEX Corporation",
  IFF: "International Flavors & Fragrances Inc.",
  IGT: "International Game Technology PLC",
  IHG: "InterContinental Hotels Group PLC",
  ILMN: "Illumina Inc.",
  INCY: "Incyte Corporation",
  INFO: "IHS Markit Ltd.",
  INTU: "Intuit Inc.",
  IP: "International Paper Company",
  IPG: "The Interpublic Group of Companies Inc.",
  IPGP: "IPG Photonics Corporation",
  IQV: "IQVIA Holdings Inc.",
  IR: "Ingersoll Rand Inc.",
  IRM: "Iron Mountain Incorporated",
  ISRG: "Intuitive Surgical Inc.",
  IT: "Gartner Inc.",
  ITW: "Illinois Tool Works Inc.",
  IVZ: "Invesco Ltd.",
  J: "Jacobs Engineering Group Inc.",
  JBHT: "J.B. Hunt Transport Services Inc.",
  JCI: "Johnson Controls International plc",
  JD: "JD.com Inc.",
  JEF: "Jefferies Financial Group Inc.",
  JKHY: "Jack Henry & Associates Inc.",
  JLL: "Jones Lang LaSalle Incorporated",
  JMIA: "Jumia Technologies AG",
  JNPR: "Juniper Networks Inc.",
  JP: "JPMorgan Chase & Co.",
  JWN: "Nordstrom Inc.",
  K: "Kellogg Company",
  KBH: "KB Home",
  KDP: "Keurig Dr Pepper Inc.",
  KE: "Kimball Electronics Inc.",
  KEL: "Kellogg Company",
  KEY: "KeyCorp",
  KEYS: "Keysight Technologies Inc.",
  KHC: "The Kraft Heinz Company",
  KIM: "Kimco Realty Corporation",
  KLAC: "KLA Corporation",
  KMB: "Kimberly-Clark Corporation",
  KMI: "Kinder Morgan Inc.",
  KMX: "CarMax Inc.",
  KODK: "Eastman Kodak Company",
  KR: "The Kroger Co.",
  KSS: "Kohl's Corporation",
  KSU: "Kansas City Southern",
  KTOS: "Kratos Defense & Security Solutions Inc.",
  KVHI: "KVH Industries Inc.",
  L: "Loews Corporation",
  LB: "L Brands Inc.",
  LBTYA: "Liberty Global plc Class A",
  LBTYK: "Liberty Global plc Class C",
  LDOS: "Leidos Holdings Inc.",
  LEG: "Leggett & Platt Incorporated",
  LEN: "Lennar Corporation",
  LHX: "L3Harris Technologies Inc.",
  LITE: "Lumentum Holdings Inc.",
  LMT: "Lockheed Martin Corporation",
  LNC: "Lincoln National Corporation",
  LNT: "Alliant Energy Corporation",
  LOGI: "Logitech International S.A.",
  LOW: "Lowe's Companies Inc.",
  LRCX: "Lam Research Corporation",
  LSCC: "Lattice Semiconductor Corporation",
  LSI: "Life Storage Inc.",
  LSTR: "Landstar System Inc.",
  LTHM: "Livent Corporation",
  LUV: "Southwest Airlines Co.",
  LVS: "Las Vegas Sands Corp.",
  LW: "Lamb Weston Holdings Inc.",
  LYFT: "Lyft Inc.",
  LYB: "LyondellBasell Industries N.V.",
  LYV: "Live Nation Entertainment Inc.",
  M: "Macy's Inc.",
  MAA: "Mid-America Apartment Communities Inc.",
  MAR: "Marriott International Inc.",
  MAS: "Masco Corporation",
  MAT: "Mattel Inc.",
  MBI: "MBIA Inc.",
  MCHP: "Microchip Technology Incorporated",
  MCK: "McKesson Corporation",
  MCO: "Moody's Corporation",
  MDLZ: "Mondelez International Inc.",
  MDP: "Meredith Corporation",
  MDT: "Medtronic plc",
  MER: "Merrill Lynch & Co. Inc.",
  MET: "MetLife Inc.",
  MFA: "MFA Financial Inc.",
  MHK: "Mohawk Industries Inc.",
  MKC: "McCormick & Company Incorporated",
  MKTX: "MarketAxess Holdings Inc.",
  MLAB: "Mesa Laboratories Inc.",
  MLHR: "Herman Miller Inc.",
  MLM: "Martin Marietta Materials Inc.",
  MMC: "Marsh & McLennan Companies Inc.",
  MMM: "3M Company",
  MNST: "Monster Beverage Corporation",
  MO: "Altria Group Inc.",
  MOH: "Molina Healthcare Inc.",
  MOS: "The Mosaic Company",
  MPC: "Marathon Petroleum Corporation",
  MPW: "Medical Properties Trust Inc.",
  MQ: "Marqeta Inc.",
  MRCY: "Mercury Systems Inc.",
  MRO: "Marathon Oil Corporation",
  MS: "Morgan Stanley",
  MSCI: "MSCI Inc.",
  MSI: "Motorola Solutions Inc.",
  MT: "ArcelorMittal S.A.",
  MTB: "M&T Bank Corporation",
  MTCH: "Match Group Inc.",
  MTD: "Mettler-Toledo International Inc.",
  MTN: "Vail Resorts Inc.",
  MTRN: "Materion Corporation",
  MTW: "The Manitowoc Company Inc.",
  MTX: "Minerals Technologies Inc.",
  MU: "Micron Technology Inc.",
  MUR: "Murphy Oil Corporation",
  MUSA: "Murphy USA Inc.",
  MVIS: "MicroVision Inc.",
  MWV: "MeadWestvaco Corporation",
  MXIM: "Maxim Integrated Products Inc.",
  MYGN: "Myriad Genetics Inc.",
  MYL: "Mylan N.V.",
  NCLH: "Norwegian Cruise Line Holdings Ltd.",
  NDAQ: "Nasdaq Inc.",
  NDSN: "Nordson Corporation",
  NE: "Noble Corporation",
  NEE: "NextEra Energy Inc.",
  NEM: "Newmont Corporation",
  NEP: "NextEra Energy Partners LP",
  NET: "Cloudflare Inc.",
  NFE: "New Fortress Energy Inc.",
  NFG: "National Fuel Gas Company",
  NKTR: "Nektar Therapeutics",
  NLOK: "NortonLifeLock Inc.",
  NLSN: "Nielsen Holdings plc",
  NOC: "Northrop Grumman Corporation",
  NOV: "NOV Inc.",
  NOW: "ServiceNow Inc.",
  NRP: "Natural Resource Partners L.P.",
  NRZ: "New Residential Investment Corp.",
  NSC: "Norfolk Southern Corporation",
  NTAP: "NetApp Inc.",
  NTES: "NetEase Inc.",
  NTRS: "Northern Trust Corporation",
  NUE: "Nucor Corporation",
  NVAX: "Novavax Inc.",
  NVR: "NVR Inc.",
  NWBI: "Northwest Bancshares Inc.",
  NWE: "NorthWestern Corporation",
  NWG: "NatWest Group plc",
  NWL: "Newell Brands Inc.",
  NWS: "News Corporation Class B",
  NWSA: "News Corporation Class A",
  NXPI: "NXP Semiconductors N.V.",
  NYCB: "New York Community Bancorp Inc.",
  NYT: "The New York Times Company",
  O: "Realty Income Corporation",
  OAS: "Oasis Petroleum Inc.",
  ODFL: "Old Dominion Freight Line Inc.",
  ODP: "Office Depot Inc.",
  OGN: "Organon & Co.",
  OHI: "Omega Healthcare Investors Inc.",
  OKE: "ONEOK Inc.",
  OMC: "Omnicom Group Inc.",
  ON: "ON Semiconductor Corporation",
  ORI: "Old Republic International Corporation",
  OSK: "Oshkosh Corporation",
  OTIS: "Otis Worldwide Corporation",
  OXY: "Occidental Petroleum Corporation",
  PARA: "Paramount Global Class B",
  PARAA: "Paramount Global Class A",
  PAYC: "Paycom Software Inc.",
  PAYX: "Paychex Inc.",
  PBCT: "People's United Financial Inc.",
  PBI: "Pitney Bowes Inc.",
  PCAR: "PACCAR Inc",
  PCG: "PG&E Corporation",
  PGR: "The Progressive Corporation",
  PFG: "Principal Financial Group Inc.",
  PGRE: "Paramount Group Inc.",
  PH: "Parker-Hannifin Corporation",
  PHM: "PulteGroup Inc.",
  PKG: "Packaging Corporation of America",
  PNC: "PNC Financial Services Group Inc.",
  PNFP: "Pinnacle Financial Partners Inc.",
  PNR: "Pentair plc",
  POOL: "Pool Corporation",
  PPG: "PPG Industries Inc.",
  PPL: "PPL Corporation",
  PRGO: "Perrigo Company plc",
  PRU: "Prudential Financial Inc.",
  PSA: "Public Storage",
  PSX: "Phillips 66",
  PTEN: "Patterson-UTI Energy Inc.",
  PTON: "Peloton Interactive Inc.",
  PVH: "PVH Corp.",
  PWR: "Quanta Services Inc.",
  PXD: "Pioneer Natural Resources Company",
  QCOM: "QUALCOMM Incorporated",
  QGEN: "Qiagen N.V.",
  QRVO: "Qorvo Inc.",
  QTWO: "Q2 Holdings Inc.",
  RCL: "Royal Caribbean Cruises Ltd.",
  RE: "Everest Re Group Ltd.",
  REG: "Regency Centers Corporation",
  REGN: "Regeneron Pharmaceuticals Inc.",
  RF: "Regions Financial Corporation",
  RHI: "Robert Half International Inc.",
  RJF: "Raymond James Financial Inc.",
  RL: "Ralph Lauren Corporation",
  RMD: "ResMed Inc.",
  ROK: "Rockwell Automation Inc.",
  ROL: "Rollins Inc.",
  ROP: "Roper Technologies Inc.",
  ROST: "Ross Stores Inc.",
  RPRX: "Royalty Pharma plc",
  RS: "Reliance Steel & Aluminum Co.",
  RSG: "Republic Services Inc.",
  RTX: "Raytheon Technologies Corporation",
  RYAAY: "Ryanair Holdings plc",
  S: "SentinelOne Inc.",
  SAIC: "Science Applications International Corporation",
  SAN: "Banco Santander S.A.",
  SAP: "SAP SE",
  SBAC: "SBA Communications Corporation",
  SBNY: "Signature Bank",
  SCHW: "Charles Schwab Corporation",
  SE: "Sea Limited",
  SEE: "Sealed Air Corporation",
  SHW: "The Sherwin-Williams Company",
  SIRI: "Sirius XM Holdings Inc.",
  SJM: "The J.M. Smucker Company",
  SLB: "Schlumberger Limited",
  SLG: "SL Green Realty Corp.",
  SLM: "SLM Corporation",
  SNA: "Snap-on Incorporated",
  SNPS: "Synopsys Inc.",
  SO: "The Southern Company",
  SPG: "Simon Property Group Inc.",
  SPGI: "S&P Global Inc.",
  SRE: "Sempra Energy",
  SSNC: "SS&C Technologies Holdings Inc.",
  STT: "State Street Corporation",
  STX: "Seagate Technology Holdings plc",
  STZ: "Constellation Brands Inc.",
  SUM: "Summit Materials Inc.",
  SUN: "Sunoco LP",
  SVXY: "ProShares Short VIX Short-Term Futures ETF",
  SWK: "Stanley Black & Decker Inc.",
  SWKS: "Skyworks Solutions Inc.",
  SWM: "Schweitzer-Mauduit International Inc.",
  SYF: "Synchrony Financial",
  SYK: "Stryker Corporation",
  SYY: "Sysco Corporation",
  TAP: "Molson Coors Beverage Company",
  TDC: "Teradata Corporation",
  TDG: "TransDigm Group Incorporated",
  TDOC: "Teladoc Health Inc.",
  TDY: "Teledyne Technologies Incorporated",
  TEAM: "Atlassian Corporation Plc",
  TEL: "TE Connectivity Ltd.",
  TENB: "Tenable Holdings Inc.",
  TER: "Teradyne Inc.",
  TEVA: "Teva Pharmaceutical Industries Limited",
  TEX: "Terex Corporation",
  TFC: "Truist Financial Corporation",
  TFX: "Teleflex Incorporated",
  TGNA: "TEGNA Inc.",
  TGT: "Target Corporation",
  THC: "Tenet Healthcare Corporation",
  TJX: "The TJX Companies Inc.",
  TMUS: "T-Mobile US Inc.",
  TNL: "Travel + Leisure Co.",
  TPR: "Tapestry Inc.",
  TRIP: "TripAdvisor Inc.",
  TRMB: "Trimble Inc.",
  TROW: "T. Rowe Price Group Inc.",
  TRV: "The Travelers Companies Inc.",
  TSCO: "Tractor Supply Company",
  TSN: "Tyson Foods Inc.",
  TT: "Trane Technologies plc",
  TTD: "The Trade Desk Inc.",
  TTE: "TotalEnergies SE",
  TTWO: "Take-Two Interactive Software Inc.",
  TWLO: "Twilio Inc.",
  TWNK: "Hostess Brands Inc.",
  TWTR: "Twitter Inc.",
  TX: "Ternium S.A.",
  TXT: "Textron Inc.",
  TYL: "Tyler Technologies Inc.",
  UA: "Under Armour Inc. Class A",
  UAA: "Under Armour Inc. Class C",
  UAL: "United Airlines Holdings Inc.",
  UBER: "Uber Technologies Inc.",
  UDR: "UDR Inc.",
  UHS: "Universal Health Services Inc.",
  ULTA: "Ulta Beauty Inc.",
  UNM: "Unum Group",
  UPC: "Universal Corporation",
  UPS: "United Parcel Service Inc.",
  URBN: "Urban Outfitters Inc.",
  URI: "United Rentals Inc.",
  USB: "U.S. Bancorp",
  VAC: "Marriott Vacations Worldwide Corporation",
  VALE: "Vale S.A.",
  VCRA: "Vocera Communications Inc.",
  VFC: "VF Corporation",
  VIAC: "ViacomCBS Inc. Class B",
  VIACA: "ViacomCBS Inc. Class A",
  VICI: "VICI Properties Inc.",
  VLO: "Valero Energy Corporation",
  VMC: "Vulcan Materials Company",
  VNO: "Vornado Realty Trust",
  VNT: "Vontier Corporation",
  VRSK: "Verisk Analytics Inc.",
  VRSN: "VeriSign Inc.",
  VRTX: "Vertex Pharmaceuticals Incorporated",
  VTR: "Ventas Inc.",
  VTRS: "Viatris Inc.",
  WAB: "Wabtec Corporation",
  WAT: "Waters Corporation",
  WBA: "Walgreens Boots Alliance Inc.",
  WBD: "Warner Bros. Discovery Inc.",
  WDC: "Western Digital Corporation",
  WEC: "WEC Energy Group Inc.",
  WELL: "Welltower Inc.",
  WHR: "Whirlpool Corporation",
  WLK: "Westlake Corporation",
  WM: "Waste Management Inc.",
  WMB: "The Williams Companies Inc.",
  WOLF: "Wolfspeed Inc.",
  WRB: "W. R. Berkley Corporation",
  WRK: "WestRock Company",
  WST: "West Pharmaceutical Services Inc.",
  WTW: "Willis Towers Watson Public Limited Company",
  WU: "The Western Union Company",
  WY: "Weyerhaeuser Company",
  WYNN: "Wynn Resorts Limited",
  X: "United States Steel Corporation",
  XEL: "Xcel Energy Inc.",
  XPO: "XPO Logistics Inc.",
  XRAY: "Dentsply Sirona Inc.",
  XRX: "Xerox Holdings Corporation",
  XYF: "X Financial",
  XYL: "Xylem Inc.",
  YUM: "Yum! Brands Inc.",
  YUMC: "Yum China Holdings Inc.",
  ZBH: "Zimmer Biomet Holdings Inc.",
  ZBRA: "Zebra Technologies Corporation",
  ZG: "Zillow Group Inc. Class A",
  ZM: "Zoom Video Communications Inc.",
  ZS: "Zscaler Inc.",
  ZTS: "Zoetis Inc.",
};

function searchTickers(query: string) {
  const q = query.toUpperCase();
  return Object.entries(POPULAR_TICKERS)
    .filter(([ticker]) => ticker.startsWith(q))
    .slice(0, 5)
    .map(([ticker, name]) => ({ ticker, name }));
}

/* ------------------------------------------------------------------ */
/* Component                                                          */
/* ------------------------------------------------------------------ */
export default function SearchBar() {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recent, setRecent] = useLocalStorage<RecentItem[]>("search-recent", []);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  const suggestions = searchTickers(query);
  const showSuggestions = open && query.length > 0;
  const showRecents = open && !query;

  /* ------------------ actions --------------------------------------- */
  const handleSelect = useCallback(
    (ticker: string) => {
      setQuery(ticker);
      setOpen(false);
      setRecent((prev) => {
        const filtered = prev.filter((r) => r.ticker !== ticker);
        return [
          { ticker, name: POPULAR_TICKERS[ticker] ?? ticker, timestamp: Date.now() },
          ...filtered,
        ].slice(0, MAX_RECENTS);
      });
      router.push(`/company/${ticker}`);
    },
    [router, setRecent]
  );

  /* ------------------ keyboard navigation ------------------------- */
  const items = showSuggestions
    ? suggestions.map((s) => s.ticker)
    : showRecents
      ? recent.map((r) => r.ticker)
      : [];

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setOpen(false);
        inputRef.current?.blur();
      }
      if (e.key === "ArrowDown") {
        e.preventDefault();
        setActiveIndex((i) => (i + 1) % items.length);
      }
      if (e.key === "ArrowUp") {
        e.preventDefault();
        setActiveIndex((i) => (i - 1 + items.length) % items.length);
      }
      if (e.key === "Enter" && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(items[activeIndex]);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [items, activeIndex, handleSelect]);

  /* ------------------ click outside -------------------------------- */
  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  /* ------------------ debounce query -------------------------------- */
  useEffect(() => {
    const t = setTimeout(() => setActiveIndex(-1), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(t);
  }, [query]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const ticker = query.trim().toUpperCase();
    if (!ticker) return;
    handleSelect(ticker);
  };

  const clearRecents = () => setRecent([]);

  /* ------------------------------------------------------------------ */
  /* Render                                                             */
  /* ------------------------------------------------------------------ */
  return (
    <div ref={wrapperRef} className="relative w-full max-w-2xl mx-auto group">
      {/* glow */}
      <div className="absolute -inset-1 bg-gradient-to-r from-brand via-blue-500 to-indigo-600 rounded-full opacity-10 group-focus-within:opacity-25 blur-xl transition duration-500" />

      {/* input */}
      <form onSubmit={handleSubmit} className="relative">
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setOpen(true)}
          className={cn(
            "flex h-16 w-full rounded-full border border-slate-200 dark:border-slate-800",
            "bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl pl-8 pr-40 py-4 text-lg dark:text-white shadow-2xl",
            "placeholder:text-slate-400 dark:placeholder:text-slate-600",
            "focus:outline-none focus:ring-4 focus:ring-brand/10 focus:border-brand/40",
            "transition-all"
          )}
          placeholder="Search for a company like AAPL, MSFT, TSLA..."
          aria-label="Search for stocks by ticker symbol or company name"
          aria-autocomplete="list"
          aria-expanded={open}
          aria-controls="search-dropdown"
          role="combobox"
        />
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
          {query && (
            <Button
              type="button"
              size="icon"
              variant="ghost"
              className="h-10 w-10 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
              onClick={() => setQuery("")}
              aria-label="Clear query"
            >
              <X className="h-5 w-5 text-slate-400" />
            </Button>
          )}
          <Button
            type="submit"
            className="h-10 px-6 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:scale-105 active:scale-95 transition-all font-semibold shadow-lg flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </form>


      {/* dropdown */}
      {(showSuggestions || showRecents) && (
        <div
          id="search-dropdown"
          className="absolute top-full mt-2 w-full rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 shadow-xl z-50 overflow-hidden"
        >
          {showRecents && !!recent.length && (
            <>
              <div className="px-4 pt-3 pb-2 flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Recent</span>
                <Button variant="link" size="sm" className="text-xs h-auto p-0" onClick={clearRecents}>
                  Clear
                </Button>
              </div>
              {recent.map((r, i) => (
                <ResultRow
                  key={r.ticker}
                  ticker={r.ticker}
                  name={r.name}
                  icon={<Clock className="h-4 w-4" />}
                  selected={i === activeIndex}
                  onClick={() => handleSelect(r.ticker)}
                />
              ))}
            </>
          )}

          {showSuggestions && (
            <>
              <div className="px-4 pt-3 pb-2">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Popular</span>
              </div>
              {suggestions.map((s, i) => (
                <ResultRow
                  key={s.ticker}
                  ticker={s.ticker}
                  name={s.name}
                  icon={<TrendingUp className="h-4 w-4" />}
                  selected={i === activeIndex}
                  onClick={() => handleSelect(s.ticker)}
                />
              ))}
            </>
          )}

          {!suggestions.length && !recent.length && (
            <div className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              No results
            </div>
          )}
        </div>
      )}

    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Sub-component: result row                                          */
/* ------------------------------------------------------------------ */
function ResultRow({
  ticker,
  name,
  icon,
  selected,
  onClick,
}: {
  ticker: string;
  name: string;
  icon: React.ReactNode;
  selected: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2 text-left transition",
        "hover:bg-slate-100 dark:hover:bg-slate-800",
        selected && "bg-brand/10 dark:bg-brand/20"
      )}
      aria-selected={selected}
    >
      <span className="text-slate-400 dark:text-slate-500">{icon}</span>
      <span className="font-medium text-slate-900 dark:text-white">{ticker}</span>
      <span className="text-sm text-slate-500 dark:text-slate-400 truncate">{name}</span>
    </button>
  );
}