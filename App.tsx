import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { KpiDataPoint, View, Role, Campaign } from './types';
import { NAVIGATION_ITEMS } from './constants';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import KpiTable from './components/KpiTable';
import DataEntry from './components/DataEntry';
import PlanBuilder from './components/PlanBuilder';
import Campaigns from './components/Campaigns';
import Auth from './components/Auth';
import { supabase } from './lib/supabase';
import { Session } from '@supabase/supabase-js';

const App: React.FC = () => {
  const [kpiData, setKpiData] = useState<KpiDataPoint[]>([]);
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [activeView, setActiveView] = useState<View>('dashboard');
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchKpiData = useCallback(async () => {
    const { data, error } = await supabase.from('kpi_data').select('*').order('date', { ascending: false });
    if (error) {
      console.error('Error fetching KPI data:', error);
    } else {
      setKpiData(data as KpiDataPoint[]);
    }
  }, []);

  const fetchCampaigns = useCallback(async () => {
    const { data, error } = await supabase.from('campaigns').select('*').order('start_date', { ascending: false });
    if (error) {
      console.error('Error fetching campaigns:', error);
    } else {
      setCampaigns(data as Campaign[]);
    }
  }, []);

  useEffect(() => {
    // This listener handles the entire auth lifecycle: initial load, login, and logout.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setIsLoading(true);
      setSession(session);
      if (session) {
        try {
          const { data, error } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', session.user.id)
            .single();

          if (error && error.code !== 'PGRST116') { 
            throw error;
          }
          
          setRole(data?.role as Role || 'staff');
          // Fetch data after session is confirmed
          await Promise.all([fetchKpiData(), fetchCampaigns()]);

        } catch (error) {
          const typedError = error as { message?: string; code?: string };
          console.error(
            `Error fetching user role: ${typedError.message || 'An unknown error occurred'}. Code: ${typedError.code || 'N/A'}`
          );
          setRole('staff');
        }
      } else {
        setRole(null);
        setKpiData([]); // Clear data on logout
        setCampaigns([]); // Clear data on logout
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [fetchKpiData, fetchCampaigns]);


  const addKpiDataPoint = useCallback(async (newDataPoint: Omit<KpiDataPoint, 'id'>) => {
    if (!session?.user) {
        console.error("No user session found. Cannot add KPI data.");
        return;
    }
    const { error } = await supabase.from('kpi_data').insert([
      { ...newDataPoint, user_id: session.user.id }
    ]);
    if (error) {
      console.error('Error inserting KPI data:', error);
    } else {
      await fetchKpiData(); // Refetch data
      setActiveView('table'); // Switch to table view
    }
  }, [session, fetchKpiData]);

  const addCampaign = useCallback(async (newCampaign: Omit<Campaign, 'id'>) => {
    if (!session?.user) {
        console.error("No user session found. Cannot add campaign.");
        return;
    }
    const { error } = await supabase.from('campaigns').insert([
        { ...newCampaign, user_id: session.user.id }
    ]);

    if (error) {
        console.error('Error inserting campaign:', error);
    } else {
        await fetchCampaigns(); // Refetch campaigns
    }
  }, [session, fetchCampaigns]);
  
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

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="flex h-screen bg-navy-50 font-sans text-navy-900">
      <Sidebar 
        navigationItems={visibleNavItems} 
        activeView={activeView} 
        setActiveView={setActiveView} 
      />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header session={session} />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-navy-50 p-6 lg:p-8">
          {renderActiveView()}
        </main>
      </div>
    </div>
  );
};

export default App;