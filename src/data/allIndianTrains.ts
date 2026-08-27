import { TrainData, StationStop, SignalAspect, WeatherCondition, TrackCondition, TrafficLevel, ExplainabilityFactor } from '../types';

export interface StationGeo {
  code: string;
  name: string;
  lat: number;
  lng: number;
}

export const INDIAN_STATIONS: Record<string, StationGeo> = {
  // Northern & Central
  NDLS: { code: 'NDLS', name: 'New Delhi', lat: 28.6415, lng: 77.2189 },
  DLI: { code: 'DLI', name: 'Old Delhi Jn', lat: 28.6607, lng: 77.2272 },
  NZM: { code: 'NZM', name: 'Hazrat Nizamuddin', lat: 28.5888, lng: 77.2534 },
  ANVT: { code: 'ANVT', name: 'Anand Vihar Terminal', lat: 28.6496, lng: 77.3159 },
  AGC: { code: 'AGC', name: 'Agra Cantt', lat: 27.1591, lng: 77.9947 },
  GWL: { code: 'GWL', name: 'Gwalior Jn', lat: 26.2163, lng: 78.1884 },
  VGLJ: { code: 'VGLJ', name: 'VGL Jhansi Jn', lat: 25.4484, lng: 78.5685 },
  BPL: { code: 'BPL', name: 'Bhopal Jn', lat: 23.2599, lng: 77.4126 },
  RKMP: { code: 'RKMP', name: 'Rani Kamlapati', lat: 23.2045, lng: 77.4398 },
  ET: { code: 'ET', name: 'Itarsi Jn', lat: 22.6139, lng: 77.7601 },
  NGP: { code: 'NGP', name: 'Nagpur Jn', lat: 21.1528, lng: 79.0882 },
  CNB: { code: 'CNB', name: 'Kanpur Central', lat: 26.4547, lng: 80.3507 },
  PRYJ: { code: 'PRYJ', name: 'Prayagraj Jn', lat: 25.4439, lng: 81.8267 },
  DDU: { code: 'DDU', name: 'Pt Deen Dayal Upadhyaya Jn', lat: 25.2818, lng: 83.1189 },
  LKO: { code: 'LKO', name: 'Lucknow Charbagh', lat: 26.8315, lng: 80.9248 },
  BSB: { code: 'BSB', name: 'Varanasi Jn', lat: 25.3267, lng: 82.9863 },
  GKP: { code: 'GKP', name: 'Gorakhpur Jn', lat: 26.7588, lng: 83.3813 },
  UMB: { code: 'UMB', name: 'Ambala Cantt Jn', lat: 30.3610, lng: 76.8285 },
  LDH: { code: 'LDH', name: 'Ludhiana Jn', lat: 30.9100, lng: 75.8573 },
  ASR: { code: 'ASR', name: 'Amritsar Jn', lat: 31.6340, lng: 74.8723 },
  JAT: { code: 'JAT', name: 'Jammu Tawi', lat: 32.7063, lng: 74.8797 },
  SVDK: { code: 'SVDK', name: 'Shri Mata Vaishno Devi Katra', lat: 32.9904, lng: 74.9318 },
  CDG: { code: 'CDG', name: 'Chandigarh', lat: 30.7016, lng: 76.8206 },
  KLK: { code: 'KLK', name: 'Kalka', lat: 30.8354, lng: 76.9351 },
  DDN: { code: 'DDN', name: 'Dehradun', lat: 30.3165, lng: 78.0322 },
  HW: { code: 'HW', name: 'Haridwar Jn', lat: 29.9457, lng: 78.1642 },
  
  // Western
  MMCT: { code: 'MMCT', name: 'Mumbai Central', lat: 18.9696, lng: 72.8193 },
  CSMT: { code: 'CSMT', name: 'Mumbai CSMT', lat: 18.9401, lng: 72.8354 },
  BDTS: { code: 'BDTS', name: 'Bandra Terminus', lat: 19.0620, lng: 72.8407 },
  LTT: { code: 'LTT', name: 'Lokmanya Tilak Terminus', lat: 19.0691, lng: 72.8906 },
  KYN: { code: 'KYN', name: 'Kalyan Jn', lat: 19.2364, lng: 73.1306 },
  PUNE: { code: 'PUNE', name: 'Pune Jn', lat: 18.5284, lng: 73.8743 },
  ST: { code: 'ST', name: 'Surat', lat: 21.1702, lng: 72.8311 },
  BRC: { code: 'BRC', name: 'Vadodara Jn', lat: 22.3072, lng: 73.1812 },
  ANND: { code: 'ANND', name: 'Anand Jn', lat: 22.5645, lng: 72.9289 },
  ND: { code: 'ND', name: 'Nadiad Jn', lat: 22.6916, lng: 72.8634 },
  ADI: { code: 'ADI', name: 'Ahmedabad Jn', lat: 23.0225, lng: 72.5714 },
  GIMB: { code: 'GIMB', name: 'Gandhidham Jn', lat: 23.0753, lng: 70.1337 },
  RJT: { code: 'RJT', name: 'Rajkot Jn', lat: 22.3039, lng: 70.8022 },
  JP: { code: 'JP', name: 'Jaipur Jn', lat: 26.9200, lng: 75.7878 },
  AII: { code: 'AII', name: 'Ajmer Jn', lat: 26.4525, lng: 74.6399 },
  JU: { code: 'JU', name: 'Jodhpur Jn', lat: 26.2868, lng: 73.0245 },
  KOTA: { code: 'KOTA', name: 'Kota Jn', lat: 25.2238, lng: 75.8753 },
  RTM: { code: 'RTM', name: 'Ratlam Jn', lat: 23.3315, lng: 75.0367 },
  INDB: { code: 'INDB', name: 'Indore Jn', lat: 22.7196, lng: 75.8577 },

  // Eastern & North East
  HWH: { code: 'HWH', name: 'Howrah Jn', lat: 22.5850, lng: 88.3426 },
  SDAH: { code: 'SDAH', name: 'Sealdah', lat: 22.5697, lng: 88.3713 },
  KOAA: { code: 'KOAA', name: 'Kolkata Chitpur', lat: 22.6027, lng: 88.3756 },
  ASN: { code: 'ASN', name: 'Asansol Jn', lat: 23.6889, lng: 86.9661 },
  DHN: { code: 'DHN', name: 'Dhanbad Jn', lat: 23.7957, lng: 86.4304 },
  GAYA: { code: 'GAYA', name: 'Gaya Jn', lat: 24.7955, lng: 85.0002 },
  PNBE: { code: 'PNBE', name: 'Patna Jn', lat: 25.6022, lng: 85.1376 },
  BJU: { code: 'BJU', name: 'Barauni Jn', lat: 25.4746, lng: 85.9734 },
  KIR: { code: 'KIR', name: 'Katihar Jn', lat: 25.5459, lng: 87.5684 },
  NJP: { code: 'NJP', name: 'New Jalpaiguri', lat: 26.6853, lng: 88.4418 },
  GHY: { code: 'GHY', name: 'Guwahati', lat: 26.1822, lng: 91.7505 },
  DBRG: { code: 'DBRG', name: 'Dibrugarh', lat: 27.4728, lng: 94.9120 },
  BBS: { code: 'BBS', name: 'Bhubaneswar', lat: 20.2668, lng: 85.8436 },
  PURI: { code: 'PURI', name: 'Puri', lat: 19.8135, lng: 85.8312 },
  CTC: { code: 'CTC', name: 'Cuttack Jn', lat: 20.4625, lng: 85.8830 },
  RPR: { code: 'RPR', name: 'Raipur Jn', lat: 21.2514, lng: 81.6296 },
  BSP: { code: 'BSP', name: 'Bilaspur Jn', lat: 22.0797, lng: 82.1409 },
  TATA: { code: 'TATA', name: 'Tatanagar Jn', lat: 22.7719, lng: 86.2029 },
  RNC: { code: 'RNC', name: 'Ranchi Jn', lat: 23.3512, lng: 85.3282 },

  // Southern
  MAS: { code: 'MAS', name: 'MGR Chennai Central', lat: 13.0827, lng: 80.2707 },
  MS: { code: 'MS', name: 'Chennai Egmore', lat: 13.0788, lng: 80.2608 },
  SBC: { code: 'SBC', name: 'KSR Bengaluru City', lat: 12.9784, lng: 77.5694 },
  SMVB: { code: 'SMVB', name: 'SMVT Bengaluru', lat: 13.0039, lng: 77.6534 },
  YPR: { code: 'YPR', name: 'Yesvantpur Jn', lat: 13.0247, lng: 77.5458 },
  MYS: { code: 'MYS', name: 'Mysuru Jn', lat: 12.3168, lng: 76.6457 },
  HYB: { code: 'HYB', name: 'Hyderabad Deccan', lat: 17.3924, lng: 78.4716 },
  SC: { code: 'SC', name: 'Secunderabad Jn', lat: 17.4344, lng: 78.5013 },
  KCG: { code: 'KCG', name: 'Kacheguda', lat: 17.3879, lng: 78.4975 },
  BZA: { code: 'BZA', name: 'Vijayawada Jn', lat: 16.5186, lng: 80.6200 },
  VSKP: { code: 'VSKP', name: 'Visakhapatnam Jn', lat: 17.7215, lng: 83.2870 },
  RU: { code: 'RU', name: 'Renigunta Jn', lat: 13.6333, lng: 79.5167 },
  TPTY: { code: 'TPTY', name: 'Tirupati', lat: 13.6288, lng: 79.4192 },
  CBE: { code: 'CBE', name: 'Coimbatore Jn', lat: 11.0006, lng: 76.9672 },
  MDU: { code: 'MDU', name: 'Madurai Jn', lat: 9.9195, lng: 78.1110 },
  TVC: { code: 'TVC', name: 'Thiruvananthapuram Central', lat: 8.4875, lng: 76.9525 },
  ERS: { code: 'ERS', name: 'Ernakulam Jn (South)', lat: 9.9678, lng: 76.2894 },
  CLT: { code: 'CLT', name: 'Kozhikode', lat: 11.2467, lng: 75.7804 },
  MAQ: { code: 'MAQ', name: 'Mangaluru Central', lat: 12.8681, lng: 74.8427 },
  UBL: { code: 'UBL', name: 'SSS Hubballi Jn', lat: 15.3524, lng: 75.1437 },
  GTL: { code: 'GTL', name: 'Guntakal Jn', lat: 15.1667, lng: 77.3667 },
  MAO: { code: 'MAO', name: 'Madgaon Jn (Goa)', lat: 15.2736, lng: 73.9786 },
  RN: { code: 'RN', name: 'Ratnagiri', lat: 16.9833, lng: 73.3333 }
};

export interface TrainTemplate {
  trainNumber: string;
  trainName: string;
  trainType: 'SUPERFAST' | 'RAJDHANI' | 'SHATABDI' | 'VANDE_BHARAT' | 'MAIL_EXPRESS';
  zone: string;
  routeStations: string[];
  currentSpeedKmH: number;
  maxSpeedKmH: number;
  currentDelayMinutes: number;
  progressPercent: number; // 0 to 100 along the route
  signalAspect: SignalAspect;
  weather: WeatherCondition;
  trackCondition: TrackCondition;
  trafficLevel: TrafficLevel;
  precedingTrainGapKm: number;
}

export const ALL_INDIAN_TRAIN_TEMPLATES: TrainTemplate[] = [
  // 1. VANDE BHARAT EXPRESSES
  {
    trainNumber: '22436',
    trainName: 'Vande Bharat Express (New Delhi → Varanasi)',
    trainType: 'VANDE_BHARAT',
    zone: 'Northern Railway',
    routeStations: ['NDLS', 'CNB', 'PRYJ', 'BSB'],
    currentSpeedKmH: 128,
    maxSpeedKmH: 130,
    currentDelayMinutes: 2,
    progressPercent: 45,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 14.5
  },
  {
    trainNumber: '22435',
    trainName: 'Vande Bharat Express (Varanasi → New Delhi)',
    trainType: 'VANDE_BHARAT',
    zone: 'Northern Railway',
    routeStations: ['BSB', 'PRYJ', 'CNB', 'NDLS'],
    currentSpeedKmH: 125,
    maxSpeedKmH: 130,
    currentDelayMinutes: 4,
    progressPercent: 62,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 12.0
  },
  {
    trainNumber: '20901',
    trainName: 'Vande Bharat Express (Mumbai Central → Gandhinagar)',
    trainType: 'VANDE_BHARAT',
    zone: 'Western Railway',
    routeStations: ['MMCT', 'ST', 'BRC', 'ANND', 'ADI'],
    currentSpeedKmH: 118,
    maxSpeedKmH: 130,
    currentDelayMinutes: 6,
    progressPercent: 55,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 9.8
  },
  {
    trainNumber: '20902',
    trainName: 'Vande Bharat Express (Gandhinagar → Mumbai Central)',
    trainType: 'VANDE_BHARAT',
    zone: 'Western Railway',
    routeStations: ['ADI', 'ANND', 'BRC', 'ST', 'MMCT'],
    currentSpeedKmH: 122,
    maxSpeedKmH: 130,
    currentDelayMinutes: 0,
    progressPercent: 35,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 15.0
  },
  {
    trainNumber: '20607',
    trainName: 'Vande Bharat Express (MGR Chennai → Mysuru)',
    trainType: 'VANDE_BHARAT',
    zone: 'Southern Railway',
    routeStations: ['MAS', 'SBC', 'MYS'],
    currentSpeedKmH: 110,
    maxSpeedKmH: 130,
    currentDelayMinutes: 3,
    progressPercent: 65,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 18.0
  },
  {
    trainNumber: '22301',
    trainName: 'Vande Bharat Express (Howrah → New Jalpaiguri)',
    trainType: 'VANDE_BHARAT',
    zone: 'Eastern Railway',
    routeStations: ['HWH', 'ASN', 'KIR', 'NJP'],
    currentSpeedKmH: 115,
    maxSpeedKmH: 130,
    currentDelayMinutes: 8,
    progressPercent: 50,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 8.5
  },
  {
    trainNumber: '20833',
    trainName: 'Vande Bharat Express (Visakhapatnam → Secunderabad)',
    trainType: 'VANDE_BHARAT',
    zone: 'East Coast Railway',
    routeStations: ['VSKP', 'BZA', 'SC'],
    currentSpeedKmH: 112,
    maxSpeedKmH: 130,
    currentDelayMinutes: 5,
    progressPercent: 40,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 14.0
  },
  {
    trainNumber: '22225',
    trainName: 'Vande Bharat Express (Mumbai CSMT → Solapur/Pune)',
    trainType: 'VANDE_BHARAT',
    zone: 'Central Railway',
    routeStations: ['CSMT', 'KYN', 'PUNE'],
    currentSpeedKmH: 88,
    maxSpeedKmH: 110,
    currentDelayMinutes: 9,
    progressPercent: 48,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 5.4
  },
  {
    trainNumber: '22447',
    trainName: 'Vande Bharat Express (New Delhi → Amb Andaura / Una)',
    trainType: 'VANDE_BHARAT',
    zone: 'Northern Railway',
    routeStations: ['NDLS', 'UMB', 'CDG'],
    currentSpeedKmH: 124,
    maxSpeedKmH: 130,
    currentDelayMinutes: 1,
    progressPercent: 70,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 16.2
  },
  {
    trainNumber: '20173',
    trainName: 'Vande Bharat Express (Rani Kamlapati → Rewa)',
    trainType: 'VANDE_BHARAT',
    zone: 'West Central Railway',
    routeStations: ['RKMP', 'BPL', 'ET'],
    currentSpeedKmH: 105,
    maxSpeedKmH: 130,
    currentDelayMinutes: 4,
    progressPercent: 30,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 11.5
  },

  // 2. RAJDHANI EXPRESSES
  {
    trainNumber: '12951',
    trainName: 'Mumbai Central Tejas Rajdhani Express (MMCT → NDLS)',
    trainType: 'RAJDHANI',
    zone: 'Western Railway',
    routeStations: ['MMCT', 'ST', 'BRC', 'RTM', 'KOTA', 'NDLS'],
    currentSpeedKmH: 115,
    maxSpeedKmH: 130,
    currentDelayMinutes: 4,
    progressPercent: 68,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 12.4
  },
  {
    trainNumber: '12952',
    trainName: 'Mumbai Central Tejas Rajdhani Express (NDLS → MMCT)',
    trainType: 'RAJDHANI',
    zone: 'Western Railway',
    routeStations: ['NDLS', 'KOTA', 'RTM', 'BRC', 'ST', 'MMCT'],
    currentSpeedKmH: 110,
    maxSpeedKmH: 130,
    currentDelayMinutes: 8,
    progressPercent: 42,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 9.6
  },
  {
    trainNumber: '12301',
    trainName: 'Howrah Rajdhani Express (via Gaya) (HWH → NDLS)',
    trainType: 'RAJDHANI',
    zone: 'Eastern Railway',
    routeStations: ['HWH', 'ASN', 'DHN', 'GAYA', 'DDU', 'PRYJ', 'CNB', 'NDLS'],
    currentSpeedKmH: 118,
    maxSpeedKmH: 130,
    currentDelayMinutes: 14,
    progressPercent: 54,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 7.2
  },
  {
    trainNumber: '12302',
    trainName: 'Howrah Rajdhani Express (via Gaya) (NDLS → HWH)',
    trainType: 'RAJDHANI',
    zone: 'Eastern Railway',
    routeStations: ['NDLS', 'CNB', 'PRYJ', 'DDU', 'GAYA', 'DHN', 'ASN', 'HWH'],
    currentSpeedKmH: 122,
    maxSpeedKmH: 130,
    currentDelayMinutes: 6,
    progressPercent: 38,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 13.0
  },
  {
    trainNumber: '12305',
    trainName: 'Kolkata Rajdhani Express (via Patna) (HWH → NDLS)',
    trainType: 'RAJDHANI',
    zone: 'Eastern Railway',
    routeStations: ['HWH', 'ASN', 'PNBE', 'DDU', 'PRYJ', 'CNB', 'NDLS'],
    currentSpeedKmH: 104,
    maxSpeedKmH: 130,
    currentDelayMinutes: 24,
    progressPercent: 46,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'CAUTION_TSR',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 4.8
  },
  {
    trainNumber: '12431',
    trainName: 'Thiruvananthapuram Rajdhani Express (TVC → NZM)',
    trainType: 'RAJDHANI',
    zone: 'Northern Railway',
    routeStations: ['TVC', 'ERS', 'CLT', 'MAQ', 'MAO', 'RN', 'KYN', 'ST', 'BRC', 'KOTA', 'NZM'],
    currentSpeedKmH: 95,
    maxSpeedKmH: 120,
    currentDelayMinutes: 38,
    progressPercent: 58,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'HEAVY_RAIN',
    trackCondition: 'CAUTION_TSR',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 6.5
  },
  {
    trainNumber: '12433',
    trainName: 'MGR Chennai Central Rajdhani Express (MAS → NZM)',
    trainType: 'RAJDHANI',
    zone: 'Northern Railway',
    routeStations: ['MAS', 'BZA', 'NGP', 'BPL', 'GWL', 'AGC', 'NZM'],
    currentSpeedKmH: 114,
    maxSpeedKmH: 130,
    currentDelayMinutes: 11,
    progressPercent: 50,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 11.2
  },
  {
    trainNumber: '12437',
    trainName: 'Secunderabad Rajdhani Express (SC → NZM)',
    trainType: 'RAJDHANI',
    zone: 'Northern Railway',
    routeStations: ['SC', 'NGP', 'BPL', 'VGLJ', 'AGC', 'NZM'],
    currentSpeedKmH: 120,
    maxSpeedKmH: 130,
    currentDelayMinutes: 5,
    progressPercent: 44,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 14.8
  },
  {
    trainNumber: '22691',
    trainName: 'Bengaluru Rajdhani Express (SBC → NZM)',
    trainType: 'RAJDHANI',
    zone: 'South Western Railway',
    routeStations: ['SBC', 'GTL', 'SC', 'NGP', 'BPL', 'VGLJ', 'AGC', 'NZM'],
    currentSpeedKmH: 108,
    maxSpeedKmH: 130,
    currentDelayMinutes: 16,
    progressPercent: 52,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 8.9
  },
  {
    trainNumber: '20501',
    trainName: 'Agartala / Dibrugarh Tejas Rajdhani Express (ANVT → DBRG)',
    trainType: 'RAJDHANI',
    zone: 'Northeast Frontier Railway',
    routeStations: ['ANVT', 'CNB', 'DDU', 'PNBE', 'KIR', 'NJP', 'GHY', 'DBRG'],
    currentSpeedKmH: 85,
    maxSpeedKmH: 110,
    currentDelayMinutes: 45,
    progressPercent: 60,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'FOG',
    trackCondition: 'RESTRICTED',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 3.8
  },

  // 3. SHATABDI & JAN SHATABDI EXPRESSES
  {
    trainNumber: '12002',
    trainName: 'Bhopal Shatabdi Express (NDLS → RKMP)',
    trainType: 'SHATABDI',
    zone: 'Northern Railway',
    routeStations: ['NDLS', 'AGC', 'GWL', 'VGLJ', 'BPL', 'RKMP'],
    currentSpeedKmH: 130,
    maxSpeedKmH: 130,
    currentDelayMinutes: 0,
    progressPercent: 72,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 16.5
  },
  {
    trainNumber: '12004',
    trainName: 'Lucknow Swarna Shatabdi Express (NDLS → LKO)',
    trainType: 'SHATABDI',
    zone: 'Northern Railway',
    routeStations: ['NDLS', 'CNB', 'LKO'],
    currentSpeedKmH: 116,
    maxSpeedKmH: 130,
    currentDelayMinutes: 7,
    progressPercent: 60,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 10.4
  },
  {
    trainNumber: '12009',
    trainName: 'Mumbai Central - Ahmedabad Shatabdi Express (MMCT → ADI)',
    trainType: 'SHATABDI',
    zone: 'Western Railway',
    routeStations: ['MMCT', 'ST', 'BRC', 'ANND', 'ND', 'ADI'],
    currentSpeedKmH: 120,
    maxSpeedKmH: 130,
    currentDelayMinutes: 3,
    progressPercent: 58,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 13.5
  },
  {
    trainNumber: '12011',
    trainName: 'Kalka Shatabdi Express (NDLS → KLK)',
    trainType: 'SHATABDI',
    zone: 'Northern Railway',
    routeStations: ['NDLS', 'UMB', 'CDG', 'KLK'],
    currentSpeedKmH: 115,
    maxSpeedKmH: 130,
    currentDelayMinutes: 2,
    progressPercent: 68,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 15.0
  },
  {
    trainNumber: '12019',
    trainName: 'Howrah - Ranchi Shatabdi Express (HWH → RNC)',
    trainType: 'SHATABDI',
    zone: 'Eastern Railway',
    routeStations: ['HWH', 'ASN', 'DHN', 'RNC'],
    currentSpeedKmH: 98,
    maxSpeedKmH: 120,
    currentDelayMinutes: 12,
    progressPercent: 48,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 7.8
  },
  {
    trainNumber: '12027',
    trainName: 'Chennai - Bengaluru Shatabdi Express (MAS → SBC)',
    trainType: 'SHATABDI',
    zone: 'Southern Railway',
    routeStations: ['MAS', 'SBC'],
    currentSpeedKmH: 105,
    maxSpeedKmH: 110,
    currentDelayMinutes: 5,
    progressPercent: 55,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 12.0
  },
  {
    trainNumber: '12046',
    trainName: 'Chandigarh - New Delhi Shatabdi Express (CDG → NDLS)',
    trainType: 'SHATABDI',
    zone: 'Northern Railway',
    routeStations: ['CDG', 'UMB', 'NDLS'],
    currentSpeedKmH: 118,
    maxSpeedKmH: 130,
    currentDelayMinutes: 1,
    progressPercent: 50,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 16.0
  },

  // 4. PREMIER SUPERFAST & MAIL / EXPRESSES
  {
    trainNumber: '12901',
    trainName: 'Gujarat Mail (Mumbai Central → Ahmedabad)',
    trainType: 'SUPERFAST',
    zone: 'Western Railway',
    routeStations: ['MMCT', 'ST', 'BRC', 'ND', 'ANND', 'ADI'],
    currentSpeedKmH: 72,
    maxSpeedKmH: 110,
    currentDelayMinutes: 12,
    progressPercent: 65,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 6.8
  },
  {
    trainNumber: '12902',
    trainName: 'Gujarat Mail (Ahmedabad → Mumbai Central)',
    trainType: 'SUPERFAST',
    zone: 'Western Railway',
    routeStations: ['ADI', 'ANND', 'ND', 'BRC', 'ST', 'MMCT'],
    currentSpeedKmH: 45,
    maxSpeedKmH: 110,
    currentDelayMinutes: 18,
    progressPercent: 35,
    signalAspect: 'STOP_RED',
    weather: 'CLEAR',
    trackCondition: 'RESTRICTED',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 4.2
  },
  {
    trainNumber: '12626',
    trainName: 'Kerala Express (NDLS → TVC)',
    trainType: 'SUPERFAST',
    zone: 'Southern Railway',
    routeStations: ['NDLS', 'AGC', 'GWL', 'VGLJ', 'BPL', 'ET', 'NGP', 'BZA', 'MAS', 'CBE', 'ERS', 'TVC'],
    currentSpeedKmH: 92,
    maxSpeedKmH: 110,
    currentDelayMinutes: 52,
    progressPercent: 48,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'CAUTION_TSR',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 5.1
  },
  {
    trainNumber: '12625',
    trainName: 'Kerala Express (TVC → NDLS)',
    trainType: 'SUPERFAST',
    zone: 'Southern Railway',
    routeStations: ['TVC', 'ERS', 'CBE', 'MAS', 'BZA', 'NGP', 'ET', 'BPL', 'VGLJ', 'GWL', 'AGC', 'NDLS'],
    currentSpeedKmH: 96,
    maxSpeedKmH: 110,
    currentDelayMinutes: 34,
    progressPercent: 55,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 7.6
  },
  {
    trainNumber: '12802',
    trainName: 'Purushottam Express (NDLS → PURI)',
    trainType: 'SUPERFAST',
    zone: 'East Coast Railway',
    routeStations: ['NDLS', 'CNB', 'PRYJ', 'DDU', 'GAYA', 'ASN', 'TATA', 'CTC', 'BBS', 'PURI'],
    currentSpeedKmH: 88,
    maxSpeedKmH: 110,
    currentDelayMinutes: 65,
    progressPercent: 42,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'CAUTION_TSR',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 4.0
  },
  {
    trainNumber: '12801',
    trainName: 'Purushottam Express (PURI → NDLS)',
    trainType: 'SUPERFAST',
    zone: 'East Coast Railway',
    routeStations: ['PURI', 'BBS', 'CTC', 'TATA', 'ASN', 'GAYA', 'DDU', 'PRYJ', 'CNB', 'NDLS'],
    currentSpeedKmH: 94,
    maxSpeedKmH: 110,
    currentDelayMinutes: 40,
    progressPercent: 58,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 8.2
  },
  {
    trainNumber: '12138',
    trainName: 'Punjab Mail (ASR → CSMT)',
    trainType: 'SUPERFAST',
    zone: 'Central Railway',
    routeStations: ['ASR', 'LDH', 'UMB', 'DLI', 'AGC', 'GWL', 'VGLJ', 'BPL', 'ET', 'KYN', 'CSMT'],
    currentSpeedKmH: 86,
    maxSpeedKmH: 110,
    currentDelayMinutes: 48,
    progressPercent: 62,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 5.6
  },
  {
    trainNumber: '12137',
    trainName: 'Punjab Mail (CSMT → ASR)',
    trainType: 'SUPERFAST',
    zone: 'Central Railway',
    routeStations: ['CSMT', 'KYN', 'ET', 'BPL', 'VGLJ', 'GWL', 'AGC', 'DLI', 'UMB', 'LDH', 'ASR'],
    currentSpeedKmH: 90,
    maxSpeedKmH: 110,
    currentDelayMinutes: 28,
    progressPercent: 38,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 9.0
  },
  {
    trainNumber: '12394',
    trainName: 'Sampoorna Kranti Express (NDLS → PNBE)',
    trainType: 'SUPERFAST',
    zone: 'East Central Railway',
    routeStations: ['NDLS', 'CNB', 'DDU', 'PNBE'],
    currentSpeedKmH: 120,
    maxSpeedKmH: 130,
    currentDelayMinutes: 8,
    progressPercent: 55,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 14.2
  },
  {
    trainNumber: '12393',
    trainName: 'Sampoorna Kranti Express (PNBE → NDLS)',
    trainType: 'SUPERFAST',
    zone: 'East Central Railway',
    routeStations: ['PNBE', 'DDU', 'CNB', 'NDLS'],
    currentSpeedKmH: 115,
    maxSpeedKmH: 130,
    currentDelayMinutes: 15,
    progressPercent: 40,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 10.8
  },
  {
    trainNumber: '12622',
    trainName: 'Tamil Nadu Express (NDLS → MAS)',
    trainType: 'SUPERFAST',
    zone: 'Southern Railway',
    routeStations: ['NDLS', 'AGC', 'GWL', 'VGLJ', 'BPL', 'ET', 'NGP', 'BZA', 'MAS'],
    currentSpeedKmH: 102,
    maxSpeedKmH: 110,
    currentDelayMinutes: 19,
    progressPercent: 52,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 11.0
  },
  {
    trainNumber: '12621',
    trainName: 'Tamil Nadu Express (MAS → NDLS)',
    trainType: 'SUPERFAST',
    zone: 'Southern Railway',
    routeStations: ['MAS', 'BZA', 'NGP', 'ET', 'BPL', 'VGLJ', 'GWL', 'AGC', 'NDLS'],
    currentSpeedKmH: 106,
    maxSpeedKmH: 110,
    currentDelayMinutes: 22,
    progressPercent: 45,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 12.5
  },
  {
    trainNumber: '12616',
    trainName: 'Grand Trunk (GT) Express (NDLS → MAS)',
    trainType: 'SUPERFAST',
    zone: 'Southern Railway',
    routeStations: ['NDLS', 'AGC', 'GWL', 'VGLJ', 'BPL', 'ET', 'NGP', 'BZA', 'MAS'],
    currentSpeedKmH: 94,
    maxSpeedKmH: 110,
    currentDelayMinutes: 38,
    progressPercent: 60,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 6.9
  },
  {
    trainNumber: '12414',
    trainName: 'Pooja Superfast Express (JAT → AII)',
    trainType: 'SUPERFAST',
    zone: 'Northern Railway',
    routeStations: ['JAT', 'LDH', 'UMB', 'DLI', 'JP', 'AII'],
    currentSpeedKmH: 82,
    maxSpeedKmH: 110,
    currentDelayMinutes: 30,
    progressPercent: 44,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 8.0
  },
  {
    trainNumber: '12424',
    trainName: 'Dibrugarh Town Rajdhani Express (NDLS → DBRG)',
    trainType: 'RAJDHANI',
    zone: 'Northeast Frontier Railway',
    routeStations: ['NDLS', 'CNB', 'PRYJ', 'DDU', 'PNBE', 'BJU', 'KIR', 'NJP', 'GHY', 'DBRG'],
    currentSpeedKmH: 100,
    maxSpeedKmH: 120,
    currentDelayMinutes: 35,
    progressPercent: 65,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 7.5
  },
  {
    trainNumber: '12840',
    trainName: 'Howrah - MGR Chennai Mail (MAS → HWH)',
    trainType: 'MAIL_EXPRESS',
    zone: 'South Eastern Railway',
    routeStations: ['MAS', 'BZA', 'VSKP', 'BBS', 'CTC', 'HWH'],
    currentSpeedKmH: 92,
    maxSpeedKmH: 110,
    currentDelayMinutes: 26,
    progressPercent: 50,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 13.1
  },
  {
    trainNumber: '12839',
    trainName: 'Howrah - MGR Chennai Mail (HWH → MAS)',
    trainType: 'MAIL_EXPRESS',
    zone: 'South Eastern Railway',
    routeStations: ['HWH', 'CTC', 'BBS', 'VSKP', 'BZA', 'MAS'],
    currentSpeedKmH: 89,
    maxSpeedKmH: 110,
    currentDelayMinutes: 32,
    progressPercent: 40,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 8.4
  },
  {
    trainNumber: '12723',
    trainName: 'Telangana Express (HYB → NDLS)',
    trainType: 'SUPERFAST',
    zone: 'South Central Railway',
    routeStations: ['HYB', 'SC', 'NGP', 'BPL', 'VGLJ', 'AGC', 'NDLS'],
    currentSpeedKmH: 98,
    maxSpeedKmH: 110,
    currentDelayMinutes: 18,
    progressPercent: 54,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 11.8
  },
  {
    trainNumber: '12296',
    trainName: 'Sanghamitra Superfast Express (DNR / PNBE → SMVB)',
    trainType: 'SUPERFAST',
    zone: 'South Western Railway',
    routeStations: ['PNBE', 'DDU', 'PRYJ', 'ET', 'NGP', 'BZA', 'MAS', 'SMVB'],
    currentSpeedKmH: 90,
    maxSpeedKmH: 110,
    currentDelayMinutes: 72,
    progressPercent: 58,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'CAUTION_TSR',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 4.5
  },
  {
    trainNumber: '12925',
    trainName: 'Paschim Superfast Express (BDTS → ASR)',
    trainType: 'SUPERFAST',
    zone: 'Western Railway',
    routeStations: ['BDTS', 'ST', 'BRC', 'RTM', 'KOTA', 'NDLS', 'UMB', 'LDH', 'ASR'],
    currentSpeedKmH: 95,
    maxSpeedKmH: 110,
    currentDelayMinutes: 25,
    progressPercent: 48,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 8.8
  },
  {
    trainNumber: '12953',
    trainName: 'August Kranti Tejas Rajdhani Express (MMCT → NZM)',
    trainType: 'RAJDHANI',
    zone: 'Western Railway',
    routeStations: ['MMCT', 'ST', 'BRC', 'RTM', 'KOTA', 'NZM'],
    currentSpeedKmH: 114,
    maxSpeedKmH: 130,
    currentDelayMinutes: 5,
    progressPercent: 62,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 14.0
  },
  {
    trainNumber: '12423',
    trainName: 'Dibrugarh Town Rajdhani Express (DBRG → NDLS)',
    trainType: 'RAJDHANI',
    zone: 'Northeast Frontier Railway',
    routeStations: ['DBRG', 'GHY', 'NJP', 'KIR', 'BJU', 'PNBE', 'DDU', 'PRYJ', 'CNB', 'NDLS'],
    currentSpeedKmH: 96,
    maxSpeedKmH: 120,
    currentDelayMinutes: 42,
    progressPercent: 50,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 5.2
  },
  {
    trainNumber: '12163',
    trainName: 'Lokmanya Tilak Terminus - MGR Chennai Central Express (LTT → MAS)',
    trainType: 'SUPERFAST',
    zone: 'Central Railway',
    routeStations: ['LTT', 'KYN', 'PUNE', 'GTL', 'RU', 'MAS'],
    currentSpeedKmH: 88,
    maxSpeedKmH: 110,
    currentDelayMinutes: 20,
    progressPercent: 45,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 9.4
  },
  {
    trainNumber: '12444',
    trainName: 'Bandra Terminus - Gorakhpur Antyodaya Express (BDTS → GKP)',
    trainType: 'SUPERFAST',
    zone: 'Western Railway',
    routeStations: ['BDTS', 'ST', 'BRC', 'RTM', 'KOTA', 'CNB', 'LKO', 'GKP'],
    currentSpeedKmH: 84,
    maxSpeedKmH: 110,
    currentDelayMinutes: 55,
    progressPercent: 52,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'CAUTION_TSR',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 4.6
  },
  {
    trainNumber: '12245',
    trainName: 'Howrah - SMVT Bengaluru Duronto Express (HWH → SMVB)',
    trainType: 'SUPERFAST',
    zone: 'South Eastern Railway',
    routeStations: ['HWH', 'BBS', 'VSKP', 'BZA', 'RU', 'SMVB'],
    currentSpeedKmH: 110,
    maxSpeedKmH: 120,
    currentDelayMinutes: 14,
    progressPercent: 58,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 13.8
  },
  {
    trainNumber: '12617',
    trainName: 'Mangala Lakshadweep Superfast Express (ERS → NZM)',
    trainType: 'SUPERFAST',
    zone: 'Southern Railway',
    routeStations: ['ERS', 'CLT', 'MAQ', 'MAO', 'RN', 'KYN', 'ET', 'BPL', 'VGLJ', 'AGC', 'NZM'],
    currentSpeedKmH: 85,
    maxSpeedKmH: 110,
    currentDelayMinutes: 44,
    progressPercent: 55,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'HEAVY_RAIN',
    trackCondition: 'CAUTION_TSR',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 6.2
  },
  {
    trainNumber: '12903',
    trainName: 'Golden Temple Mail (MMCT → ASR)',
    trainType: 'MAIL_EXPRESS',
    zone: 'Western Railway',
    routeStations: ['MMCT', 'ST', 'BRC', 'RTM', 'KOTA', 'NZM', 'UMB', 'LDH', 'ASR'],
    currentSpeedKmH: 90,
    maxSpeedKmH: 110,
    currentDelayMinutes: 29,
    progressPercent: 46,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 8.5
  },
  {
    trainNumber: '12056',
    trainName: 'Dehradun - New Delhi Jan Shatabdi Express (DDN → NDLS)',
    trainType: 'SHATABDI',
    zone: 'Northern Railway',
    routeStations: ['DDN', 'HW', 'NDLS'],
    currentSpeedKmH: 95,
    maxSpeedKmH: 110,
    currentDelayMinutes: 6,
    progressPercent: 60,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 12.0
  },
  {
    trainNumber: '12417',
    trainName: 'Prayagraj Express (PRYJ → NDLS)',
    trainType: 'SUPERFAST',
    zone: 'North Central Railway',
    routeStations: ['PRYJ', 'CNB', 'NDLS'],
    currentSpeedKmH: 120,
    maxSpeedKmH: 130,
    currentDelayMinutes: 3,
    progressPercent: 75,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 15.6
  },
  {
    trainNumber: '12555',
    trainName: 'Gorakhdham Superfast Express (GKP → BTI / NDLS)',
    trainType: 'SUPERFAST',
    zone: 'North Eastern Railway',
    routeStations: ['GKP', 'LKO', 'CNB', 'NDLS'],
    currentSpeedKmH: 94,
    maxSpeedKmH: 110,
    currentDelayMinutes: 38,
    progressPercent: 62,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 7.0
  },
  {
    trainNumber: '22692',
    trainName: 'Bengaluru Rajdhani Express (NZM → SBC)',
    trainType: 'RAJDHANI',
    zone: 'South Western Railway',
    routeStations: ['NZM', 'AGC', 'VGLJ', 'BPL', 'NGP', 'SC', 'GTL', 'SBC'],
    currentSpeedKmH: 112,
    maxSpeedKmH: 130,
    currentDelayMinutes: 10,
    progressPercent: 40,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 13.2
  },
  {
    trainNumber: '12860',
    trainName: 'Gitanjali Express (HWH → CSMT)',
    trainType: 'SUPERFAST',
    zone: 'South Eastern Railway',
    routeStations: ['HWH', 'TATA', 'BSP', 'RPR', 'NGP', 'KYN', 'CSMT'],
    currentSpeedKmH: 92,
    maxSpeedKmH: 110,
    currentDelayMinutes: 46,
    progressPercent: 52,
    signalAspect: 'CAUTION_YELLOW',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'HIGH',
    precedingTrainGapKm: 5.8
  },
  {
    trainNumber: '12859',
    trainName: 'Gitanjali Express (CSMT → HWH)',
    trainType: 'SUPERFAST',
    zone: 'South Eastern Railway',
    routeStations: ['CSMT', 'KYN', 'NGP', 'RPR', 'BSP', 'TATA', 'HWH'],
    currentSpeedKmH: 96,
    maxSpeedKmH: 110,
    currentDelayMinutes: 36,
    progressPercent: 44,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 8.0
  },
  {
    trainNumber: '12314',
    trainName: 'Sealdah Rajdhani Express (NDLS → SDAH)',
    trainType: 'RAJDHANI',
    zone: 'Eastern Railway',
    routeStations: ['NDLS', 'CNB', 'DDU', 'GAYA', 'DHN', 'ASN', 'SDAH'],
    currentSpeedKmH: 116,
    maxSpeedKmH: 130,
    currentDelayMinutes: 7,
    progressPercent: 55,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 12.0
  },
  {
    trainNumber: '12413',
    trainName: 'Pooja Superfast Express (AII → JAT)',
    trainType: 'SUPERFAST',
    zone: 'Northern Railway',
    routeStations: ['AII', 'JP', 'DLI', 'UMB', 'LDH', 'JAT'],
    currentSpeedKmH: 88,
    maxSpeedKmH: 110,
    currentDelayMinutes: 22,
    progressPercent: 50,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'MEDIUM',
    precedingTrainGapKm: 9.2
  },
  {
    trainNumber: '22439',
    trainName: 'Vande Bharat Express (New Delhi → SVDK Katra)',
    trainType: 'VANDE_BHARAT',
    zone: 'Northern Railway',
    routeStations: ['NDLS', 'UMB', 'LDH', 'JAT', 'SVDK'],
    currentSpeedKmH: 125,
    maxSpeedKmH: 130,
    currentDelayMinutes: 0,
    progressPercent: 68,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 18.5
  },
  {
    trainNumber: '22440',
    trainName: 'Vande Bharat Express (SVDK Katra → New Delhi)',
    trainType: 'VANDE_BHARAT',
    zone: 'Northern Railway',
    routeStations: ['SVDK', 'JAT', 'LDH', 'UMB', 'NDLS'],
    currentSpeedKmH: 120,
    maxSpeedKmH: 130,
    currentDelayMinutes: 3,
    progressPercent: 32,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 15.2
  },
  {
    trainNumber: '12059',
    trainName: 'Kota Jan Shatabdi Express (KOTA → NZM)',
    trainType: 'SHATABDI',
    zone: 'West Central Railway',
    routeStations: ['KOTA', 'NZM'],
    currentSpeedKmH: 108,
    maxSpeedKmH: 110,
    currentDelayMinutes: 4,
    progressPercent: 64,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 14.0
  },
  {
    trainNumber: '12955',
    trainName: 'Mumbai Central - Jaipur Superfast Express (MMCT → JP)',
    trainType: 'SUPERFAST',
    zone: 'Western Railway',
    routeStations: ['MMCT', 'ST', 'BRC', 'RTM', 'KOTA', 'JP'],
    currentSpeedKmH: 94,
    maxSpeedKmH: 110,
    currentDelayMinutes: 16,
    progressPercent: 50,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 10.5
  },
  {
    trainNumber: '12015',
    trainName: 'Ajmer Shatabdi Express (NDLS → AII)',
    trainType: 'SHATABDI',
    zone: 'North Western Railway',
    routeStations: ['NDLS', 'JP', 'AII'],
    currentSpeedKmH: 112,
    maxSpeedKmH: 120,
    currentDelayMinutes: 5,
    progressPercent: 58,
    signalAspect: 'CLEAR_GREEN',
    weather: 'CLEAR',
    trackCondition: 'NORMAL',
    trafficLevel: 'LOW',
    precedingTrainGapKm: 13.0
  }
];

// Helper to build realistic stops & calculations
function calculateDistanceBetween(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function formatMinutesToTime(totalMinutes: number): string {
  const normalized = (totalMinutes + 1440) % 1440;
  const hrs = Math.floor(normalized / 60);
  const mins = Math.floor(normalized % 60);
  return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}

export function generateAllRunningTrains(): TrainData[] {
  const baseEpochMinutes = 6 * 60; // 06:00 AM base start time for reference

  return ALL_INDIAN_TRAIN_TEMPLATES.map((tmpl, trainIdx) => {
    const routeStationsGeo = tmpl.routeStations.map((code) => {
      return INDIAN_STATIONS[code] || { code, name: code, lat: 20.0, lng: 78.0 };
    });

    const source = routeStationsGeo[0];
    const destination = routeStationsGeo[routeStationsGeo.length - 1];

    // Compute cumulative distances
    let cumDist = 0;
    const distances: number[] = [0];
    for (let i = 1; i < routeStationsGeo.length; i++) {
      const segDist = calculateDistanceBetween(
        routeStationsGeo[i - 1].lat,
        routeStationsGeo[i - 1].lng,
        routeStationsGeo[i].lat,
        routeStationsGeo[i].lng
      );
      cumDist += Math.max(25, segDist);
      distances.push(cumDist);
    }
    const totalDistanceKm = cumDist;

    // Determine current position based on progressPercent
    const currentProgressDist = (tmpl.progressPercent / 100) * totalDistanceKm;
    let currStationIndex = 0;
    for (let i = 0; i < distances.length - 1; i++) {
      if (currentProgressDist >= distances[i]) {
        currStationIndex = i;
      }
    }

    const nextStationIndex = Math.min(routeStationsGeo.length - 1, currStationIndex + 1);
    const currStnGeo = routeStationsGeo[currStationIndex];
    const nextStnGeo = routeStationsGeo[nextStationIndex];

    const segStartDist = distances[currStationIndex];
    const segEndDist = distances[nextStationIndex];
    const segSpan = Math.max(1, segEndDist - segStartDist);
    const segRatio = Math.max(0, Math.min(1, (currentProgressDist - segStartDist) / segSpan));

    const currentLatitude = Number((currStnGeo.lat + (nextStnGeo.lat - currStnGeo.lat) * segRatio).toFixed(4));
    const currentLongitude = Number((currStnGeo.lng + (nextStnGeo.lng - currStnGeo.lng) * segRatio).toFixed(4));
    const distanceToNextStationKm = Math.max(5, Math.round(segEndDist - currentProgressDist));

    // Construct realistic stops
    let runningSchedMins = baseEpochMinutes + (trainIdx * 25) % 180;
    const stops: StationStop[] = routeStationsGeo.map((stn, idx) => {
      const dist = distances[idx];
      const prevDist = idx > 0 ? distances[idx - 1] : 0;
      const legDist = dist - prevDist;
      
      const travelMins = idx === 0 ? 0 : Math.round((legDist / (tmpl.maxSpeedKmH * 0.85)) * 60);
      const schedArr = runningSchedMins + travelMins;
      const haltMins = idx === 0 || idx === routeStationsGeo.length - 1 ? 0 : (idx % 2 === 0 ? 5 : 3);
      const schedDep = schedArr + haltMins;
      runningSchedMins = schedDep;

      // Predict delays
      let predictedDelay = 0;
      let status: 'DEPARTED' | 'CURRENT' | 'NEXT' | 'UPCOMING' = 'UPCOMING';

      if (idx < currStationIndex) {
        status = 'DEPARTED';
        predictedDelay = Math.max(0, tmpl.currentDelayMinutes - (currStationIndex - idx) * 2);
      } else if (idx === currStationIndex) {
        status = segRatio > 0.8 ? 'CURRENT' : 'DEPARTED';
        predictedDelay = tmpl.currentDelayMinutes;
      } else if (idx === nextStationIndex) {
        status = 'NEXT';
        predictedDelay = tmpl.currentDelayMinutes;
      } else {
        status = 'UPCOMING';
        // ML delay recovery / accumulation model
        const extraSlackRecovery = Math.round((idx - nextStationIndex) * 1.5);
        predictedDelay = Math.max(0, tmpl.currentDelayMinutes - extraSlackRecovery);
      }

      const predArr = schedArr + predictedDelay;
      const predDep = schedDep + predictedDelay;
      const confScore = Math.max(82, Math.min(99, 99 - (idx - currStationIndex) * 3));

      const spread = Math.max(2, Math.round((100 - confScore) * 0.4));
      const etaRange = `${formatMinutesToTime(predArr - spread)} - ${formatMinutesToTime(predArr + spread)}`;

      return {
        stationCode: stn.code,
        stationName: stn.name,
        distanceKm: dist,
        latitude: stn.lat,
        longitude: stn.lng,
        scheduledArrival: formatMinutesToTime(schedArr),
        scheduledDeparture: formatMinutesToTime(schedDep),
        predictedArrival: formatMinutesToTime(predArr),
        predictedDeparture: formatMinutesToTime(predDep),
        predictedDelayMinutes: predictedDelay,
        confidenceScore: confScore,
        etaRange,
        riskLevel: predictedDelay > 20 ? 'HIGH' : predictedDelay > 8 ? 'MEDIUM' : 'LOW',
        status,
        platform: ((trainIdx + idx) % 5) + 1,
        historicalAvgHaltMins: haltMins
      };
    });

    const destStop = stops[stops.length - 1];
    const destinationETA = destStop.predictedArrival;
    const destinationPredictedDelay = destStop.predictedDelayMinutes;
    const destinationConfidence = destStop.confidenceScore;
    const destinationETARange = destStop.etaRange;
    const destinationRisk = destStop.riskLevel;

    // Explainability factors
    const explainabilityFactors: ExplainabilityFactor[] = [
      {
        id: `f-${tmpl.trainNumber}-1`,
        name: tmpl.currentDelayMinutes > 15 ? 'Signal & Interlocking Hold' : 'Section Headway Clearance',
        category: tmpl.currentDelayMinutes > 15 ? 'SIGNAL' : 'TRAFFIC_CONGESTION',
        impactMinutes: tmpl.currentDelayMinutes > 15 ? Math.round(tmpl.currentDelayMinutes * 0.45) : 2,
        description: `Active block section spacing (${tmpl.precedingTrainGapKm} km) near ${nextStnGeo.name}`,
        severity: tmpl.currentDelayMinutes > 15 ? 'high' : 'low'
      },
      {
        id: `f-${tmpl.trainNumber}-2`,
        name: tmpl.trackCondition === 'CAUTION_TSR' ? 'Temporary Speed Restriction (TSR)' : 'Permanent Way Geometry',
        category: 'TRACK_RESTRICTION',
        impactMinutes: tmpl.trackCondition === 'CAUTION_TSR' ? 8 : 1,
        description: `Track engineering caution order on ${currStnGeo.name} - ${nextStnGeo.name} line`,
        severity: tmpl.trackCondition === 'CAUTION_TSR' ? 'high' : 'low'
      },
      {
        id: `f-${tmpl.trainNumber}-3`,
        name: 'Loco Cruise & Recovery Slack',
        category: 'SPEED_RECOVERY',
        impactMinutes: -Math.max(1, Math.round(tmpl.maxSpeedKmH > 120 ? 4 : 2)),
        description: `High-power traction maintaining optimal MPS (${tmpl.maxSpeedKmH} km/h)`,
        severity: 'low'
      },
      {
        id: `f-${tmpl.trainNumber}-4`,
        name: 'Dwell Time & Passenger Boarding',
        category: 'STATION_HALT',
        impactMinutes: 3,
        description: `Average dwell margin at major junction stations`,
        severity: 'low'
      }
    ];

    return {
      id: `train-${tmpl.trainNumber}`,
      trainNumber: tmpl.trainNumber,
      trainName: tmpl.trainName,
      trainType: tmpl.trainType,
      source: source.code,
      sourceName: source.name,
      destination: destination.code,
      destinationName: destination.name,
      totalDistanceKm,
      currentLocationName: `${currStnGeo.name} → ${nextStnGeo.name} (${Math.round(currentProgressDist)} km)`,
      currentLatitude,
      currentLongitude,
      currentSpeedKmH: tmpl.currentSpeedKmH,
      maxSpeedKmH: tmpl.maxSpeedKmH,
      currentDelayMinutes: tmpl.currentDelayMinutes,
      currentStationIndex: currStationIndex,
      nextStationCode: nextStnGeo.code,
      nextStationName: nextStnGeo.name,
      distanceToNextStationKm,
      lastUpdated: 'Live GPS Telemetry',
      signalAspect: tmpl.signalAspect,
      weather: tmpl.weather,
      trackCondition: tmpl.trackCondition,
      trafficLevel: tmpl.trafficLevel,
      precedingTrainGapKm: tmpl.precedingTrainGapKm,
      destinationETA,
      destinationPredictedDelay,
      destinationConfidence,
      destinationETARange,
      destinationRisk,
      stops,
      explainability: explainabilityFactors
    };
  });
}

export const ALL_RUNNING_INDIAN_TRAINS: TrainData[] = generateAllRunningTrains();
