import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { KpiDataPoint, View, Role, Campaign } from './types';
import { NAVIGATION_ITEMS, MOCK_KPI_DATA, MOCK_CAMPAIGN_DATA } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KpiTable from './components/KpiTable';
import DataEntry from './components/DataEntry';
import PlanBuilder from './components/PlanBuilder';
import Campaigns from './components/Campaigns';
import Auth from './components/Auth';
import { supabase, isSupabaseConfigured } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [kpiData, setKpiData] = useState<KpiDataPoint[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const isSupabaseAvailable = isSupabaseConfigured;
  const isDemoMode = !isSupabaseAvailable;

  const fetchKpiData = useCallback(async () => {
    if (!isSupabaseAvailable) {
      setKpiData(MOCK_KPI_DATA.map(item => ({ ...item })));
      return;
    }
    const { data, error } = await supabase.from('kpi_data').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching KPI data:', error);
    } else {
      const normalizedData = (data ?? []).map((item) => ({
        id: item.id,
        date: item.date,
        type: (item.type ?? item.entry_type) as KpiDataPoint['type'],
        metric: item.metric,
        quantity: item.quantity,
        notes: item.notes ?? undefined,
        campaignId: item.campaignId ?? item.campaign_id ?? undefined,
        link: item.link ?? item.url ?? undefined,
      }));
      setKpiData(normalizedData);
    }
  }, [isSupabaseAvailable]);

  const fetchCampaigns = useCallback(async () => {
    if (!isSupabaseAvailable) {
      setCampaigns(MOCK_CAMPAIGN_DATA.map(item => ({ ...item })));
      return;
    }
    const { data, error } = await supabase.from('campaigns').select('*').order('start_date', { ascending: false });
    if (error) {
      console.error('Error fetching campaigns:', error);
    } else {
      const normalizedCampaigns = (data ?? []).map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description,
        startDate: item.startDate ?? item.start_date,
        endDate: item.endDate ?? item.end_date,
      }));
      setCampaigns(normalizedCampaigns);
    }
  }, [isSupabaseAvailable]);

  useEffect(() => {
    let isActive = true;

    if (!isSupabaseAvailable) {
      setSession(null);
      setRole('chief');
      setKpiData(MOCK_KPI_DATA.map(item => ({ ...item })));
      setCampaigns(MOCK_CAMPAIGN_DATA.map(item => ({ ...item })));
      setIsLoading(false);

      return () => {
        isActive = false;
      };
    }

    const handleSessionChange = async (newSession: Session | null) => {
      if (!isActive) return;

      setIsLoading(true);
      setSession(newSession);

      if (newSession) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', newSession.user.id)
            .single();

          if (error && error.code !== 'PGRST116') {
            throw error;
          }

          if (!isActive) return;

          setRole((data?.role as Role) || 'staff');

          await Promise.all([fetchKpiData(), fetchCampaigns()]);
        } catch (error) {
          const typedError = error as { message?: string; code?: string };
          console.error(
            `Error fetching user role: ${typedError.message || 'An unknown error occurred'}. Code: ${typedError.code || 'N/A'}`
          );

          if (!isActive) return;
          setRole('staff');
        }
      } else {
        setRole(null);
        setKpiData([]);
        setCampaigns([]);
      }

      if (isActive) {
        setIsLoading(false);
      }
    };

    const loadInitialSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          throw error;
        }
        await handleSessionChange(data?.session ?? null);
      } catch (error) {
        console.error('Error retrieving initial session:', error);
        await handleSessionChange(null);
      }
    };

    loadInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      handleSessionChange(session);
    });

    return () => {
      isActive = false;
      subscription?.unsubscribe();
    };
  }, [fetchKpiData, fetchCampaigns, isSupabaseAvailable]);


  const addKpiDataPoint = useCallback(async (newDataPoint: Omit<KpiDataPoint, 'id'>) => {
    if (isDemoMode) {
      setKpiData(prevData => {
        const nextId = prevData.length > 0 ? Math.max(...prevData.map(item => item.id)) + 1 : 1;
        const entry: KpiDataPoint = { id: nextId, ...newDataPoint };
        return [entry, ...prevData];
      });
      setActiveView('table');
      return;
    }
    if (!session?.user) {
        console.error("No user session found. Cannot add KPI data.");
        return;
    }
    const { error } = await supabase.from('kpi_data').insert([
      {
        date: newDataPoint.date,
        type: newDataPoint.type,
        metric: newDataPoint.metric,
        quantity: newDataPoint.quantity,
        notes: newDataPoint.notes ?? null,
        campaign_id: newDataPoint.campaignId ?? null,
        link: newDataPoint.link ?? null,
        user_id: session.user.id,
      }
    ]);
    if (error) {
      console.error('Error inserting KPI data:', error);
    } else {
      await fetchKpiData(); // Refetch data
      setActiveView('table'); // Switch to table view
    }
  }, [isDemoMode, session, fetchKpiData]);

  const addCampaign = useCallback(async (newCampaign: Omit<Campaign, 'id'>) => {
    if (isDemoMode) {
      setCampaigns(prevCampaigns => {
        const nextId = prevCampaigns.length > 0 ? Math.max(...prevCampaigns.map(item => item.id)) + 1 : 1;
        const campaign: Campaign = { id: nextId, ...newCampaign };
        return [campaign, ...prevCampaigns];
      });
      return;
    }
    if (!session?.user) {
        console.error("No user session found. Cannot add campaign.");
        return;
    }
    const { error } = await supabase.from('campaigns').insert([
        {
          name: newCampaign.name,
          description: newCampaign.description,
          start_date: newCampaign.startDate,
          end_date: newCampaign.endDate,
          user_id: session.user.id
        }
    ]);

    if (error) {
        console.error('Error inserting campaign:', error);
    } else {
        await fetchCampaigns(); // Refetch campaigns
    }
  }, [isDemoMode, session, fetchCampaigns]);
  
  const visibleNavItems = useMemo(() => {
    if (!role) return [];
    return NAVIGATION_ITEMS.filter(item => item.roles.includes(role));
  }, [role]);

  const isViewAllowed = useCallback((view: View) => {
    if (!role) return false;
    const item = NAVIGATION_ITEMS.find(navItem => navItem.id === view);
    return item ? item.roles.includes(role) : false;
  }, [role]);
  
  useEffect(() => {
    if (role && !isViewAllowed(activeView)) {
      setActiveView('dashboard');
    }
  }, [role, activeView, isViewAllowed]);

  const renderActiveView = () => {
    if (!role || !isViewAllowed(activeView)) {
      return <Dashboard data={kpiData} campaigns={campaigns} />;
    }

    switch (activeView) {
      case 'dashboard':
        return <Dashboard data={kpiData} campaigns={campaigns} />;
      case 'table':
        return <KpiTable data={kpiData} />;
      case 'data-entry':
        return <DataEntry onSubmit={addKpiDataPoint} campaigns={campaigns} />;
      case 'plan-builder':
        return <PlanBuilder />;
      case 'campaigns':
        return <Campaigns campaigns={campaigns} onAddCampaign={addCampaign} />;
      default:
        return <Dashboard data={kpiData} campaigns={campaigns} />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-navy-50">
        <div className="text-navy-700 font-semibold">Loading...</div>
      </div>
    );
  }

  if (!session && isSupabaseAvailable) {
    return <Auth supabaseAvailable={isSupabaseAvailable} />;
  }

  return (
    <div className="flex h-screen bg-navy-50 font-sans text-navy-900">
      <Sidebar
        navigationItems={visibleNavItems}
        activeView={activeView}
        setActiveView={setActiveView}
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header session={session} isDemoMode={isDemoMode} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-navy-50 p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default App;