import { KpiDataPoint, EntryType, NavItem, Campaign } from './types';
import { HomeIcon, TableCellsIcon, DocumentPlusIcon, ClipboardDocumentListIcon, MegaphoneIcon } from './components/Icons';

export const MOCK_CAMPAIGN_DATA: Campaign[] = [
  {
    id: 1,
    name: 'Snake River Navigation Safety',
    description: 'Seasonal outreach encouraging safe recreation along the Lower Snake River.',
    startDate: '2024-05-01',
    endDate: '2024-09-30',
  },
  {
    id: 2,
    name: 'Mill Creek Flood Risk Awareness',
    description: 'Community education campaign focused on spring flood preparedness.',
    startDate: '2024-02-15',
    endDate: '2024-04-30',
  },
];

export const MOCK_KPI_DATA: KpiDataPoint[] = [
  {
    id: 101,
    date: '2024-09-10',
    type: EntryType.OUTTAKE,
    metric: 'Media pickups',
    quantity: 14,
    notes: 'Regional outlets covered the new lock operations schedule.',
    campaignId: 1,
  },
  {
    id: 102,
    date: '2024-09-05',
    type: EntryType.OUTPUT,
    metric: 'News release',
    quantity: 3,
    notes: 'Safety reminder releases distributed to local media partners.',
    campaignId: 1,
    link: 'https://example.com/releases/snake-river-safety',
  },
  {
    id: 103,
    date: '2024-08-28',
    type: EntryType.OUTTAKE,
    metric: 'Engagement rate',
    quantity: 4.8,
    notes: 'Average engagement across campaign social content.',
    campaignId: 1,
  },
  {
    id: 104,
    date: '2024-03-18',
    type: EntryType.OUTCOME,
    metric: 'Awareness lift',
    quantity: 18,
    notes: 'Post-event survey showed increased awareness of flood risks.',
    campaignId: 2,
  },
  {
    id: 105,
    date: '2024-03-12',
    type: EntryType.OUTTAKE,
    metric: 'Video views',
    quantity: 1260,
    notes: 'Preparedness PSA performance on social channels.',
    campaignId: 2,
  },
];


export const NAVIGATION_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon, roles: ['chief', 'staff'] },
  { id: 'table', label: 'Data Explorer', icon: TableCellsIcon, roles: ['chief', 'staff'] },
  { id: 'data-entry', label: 'Add Entry', icon: DocumentPlusIcon, roles: ['chief', 'staff'] },
  { id: 'campaigns', label: 'Campaigns', icon: MegaphoneIcon, roles: ['chief'] },
  { id: 'plan-builder', label: 'Plan Builder', icon: ClipboardDocumentListIcon, roles: ['chief'] },
];

export const ENTRY_TYPES = Object.values(EntryType);

export const METRIC_OPTIONS: Record<EntryType, string[]> = {
    [EntryType.OUTPUT]: [
      'News release', 
      'Media advisory', 
      'Media engagement (interviews/briefs)', 
      'Web article/Feature', 
      'DVIDS upload (photo/video)', 
      'Social posts (FB/X/IG/LI)', 
      'Infographic', 
      'Factsheet/One-pager', 
      'FAQ/Q&A', 
      'Video package/Reel/Short', 
      'Photo set', 
      'Public meeting/Open house', 
      'Stakeholder briefing deck', 
      'Talking points/Speech', 
      'Newsletter (internal/external)', 
      'Public notice', 
      'Blog post', 
      'Radio PSA/Podcast guest', 
      'Op-ed',
      'Email to distro/Workforce note', 
      'Congressional update',
      'Other',
    ],
    [EntryType.OUTCOME]: [
      'Awareness lift',
      'Understanding of issue/process',
      'Trust/credibility indicators',
      'Intent to participate/comply',
      'Permit/application completeness',
      'Public meeting civility/productivity',
      'Rumor reduction/Misinfo countered',
      'Safety behavior adoption (e.g., life jacket use)',
      'Preparedness actions taken',
      'Support for decisions/policies',
      'Stakeholder collaboration',
      'Other',
    ],
    [EntryType.OUTTAKE]: [
      'Reach/Impressions', 
      'Engagement rate', 
      'Reactions/Comments/Shares', 
      'Click-through rate', 
      'Video views', 
      'Average watch time', 
      'Web sessions', 
      'Time on page', 
      'Bounce rate', 
      'Media pickups', 
      'Share of voice', 
      'Earned sentiment', 
      'Event attendance', 
      'Questions received', 
      'Call/email volume', 
      'Newsletter',
      'Other',
    ],
};