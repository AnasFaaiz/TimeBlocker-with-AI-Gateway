import React, { useMemo, useState, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';

interface AnalyticsProps {
  events: any[]; // Replace with proper CalendarEvent type
}

interface ExportOptions {
  format: 'pdf' | 'csv' | 'json' | 'xlsx';
  dateRange?: { start: Date; end: Date };
  includeCharts?: boolean;
}

interface Goal {
  id: string;
  title: string;
  target: number;
  current: number;
  type: 'completion' | 'time' | 'tasks';
  deadline?: Date;
}

const AnalyticsDashboard: React.FC<AnalyticsProps> = ({ events }) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'performance' | 'time' | 'reports' | 'goals'>('overview');
  const [timeFilter, setTimeFilter] = useState<'today' | 'week' | 'month' | 'year'>('week');
  const [reportType, setReportType] = useState<'productivity' | 'time-analysis' | 'custom'>('productivity');
  const [showExportModal, setShowExportModal] = useState(false);
  const [goals, setGoals] = useState<Goal[]>([
    { id: '1', title: 'Complete 50 tasks this month', target: 50, current: 32, type: 'tasks', deadline: new Date('2025-06-01') },
    { id: '2', title: 'Achieve 85% completion rate', target: 85, current: 73, type: 'completion' },
    { id: '3', title: 'Log 40 hours this week', target: 40, current: 28, type: 'time' }
  ]);

  // Enhanced analytics calculation
  const analytics = useMemo(() => {
    const totalEvents = events.length;
    const completedEvents = events.filter(e => e.extendedProps?.completed).length;
    const pendingEvents = totalEvents - completedEvents;
    const completionRate = totalEvents > 0 ? Math.round((completedEvents / totalEvents) * 100) : 0;
    
    // Priority distribution
    const highPriority = events.filter(e => e.extendedProps?.priority === 'high').length;
    const mediumPriority = events.filter(e => e.extendedProps?.priority === 'medium').length;
    const lowPriority = events.filter(e => e.extendedProps?.priority === 'low').length;
    
    // Time-based analytics
    const today = new Date();
    const thisWeek = events.filter(e => {
      const eventDate = new Date(e.start);
      const startOfWeek = new Date(today.getTime() - today.getDay() * 24 * 60 * 60 * 1000);
      return eventDate >= startOfWeek;
    }).length;
    
    const overdue = events.filter(e => {
      if (!e.end || e.extendedProps?.completed) return false;
      return new Date(e.end) < new Date();
    }).length;

    // Performance metrics
    const avgCompletionTime = events
      .filter(e => e.extendedProps?.completed && e.start && e.end)
      .reduce((acc, e) => acc + (new Date(e.end).getTime() - new Date(e.start).getTime()), 0) / 
      (completedEvents || 1);

    const productivityScore = Math.round(
      (completionRate * 0.4) + 
      ((totalEvents - overdue) / totalEvents * 100 * 0.3) + 
      (highPriority > 0 ? (completedEvents / highPriority * 100 * 0.3) : 30)
    );

    // Time tracking data
    const totalTimeLogged = events.reduce((acc, e) => {
      if (e.start && e.end) {
        return acc + (new Date(e.end).getTime() - new Date(e.start).getTime()) / (1000 * 60 * 60);
      }
      return acc;
    }, 0);

    const weeklyTimeDistribution = [
      { day: 'Mon', hours: 6.5 },
      { day: 'Tue', hours: 8.2 },
      { day: 'Wed', hours: 7.1 },
      { day: 'Thu', hours: 9.0 },
      { day: 'Fri', hours: 7.8 },
      { day: 'Sat', hours: 3.2 },
      { day: 'Sun', hours: 2.1 }
    ];

    return {
      totalEvents,
      completedEvents,
      pendingEvents,
      completionRate,
      highPriority,
      mediumPriority,
      lowPriority,
      thisWeek,
      overdue,
      avgCompletionTime,
      productivityScore,
      totalTimeLogged,
      weeklyTimeDistribution
    };
  }, [events, timeFilter]);

  const handleExport = useCallback((options: ExportOptions) => {
    // Export logic would go here
    console.log('Exporting with options:', options);
    setShowExportModal(false);
  }, []);

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'performance':
        return renderPerformanceMetrics();
      case 'time':
        return renderTimeTracking();
      case 'reports':
        return renderCustomReports();
      case 'goals':
        return renderGoalTracking();
      default:
        return renderOverview();
    }
  };

  const renderOverview = () => (
    <>
      {/* Quick Stats */}
      <StatsSection>
        <SectionTitle>📈 Dashboard Overview</SectionTitle>
        <StatsGrid>
          <StatCard variant="primary">
            <StatIcon>📊</StatIcon>
            <StatNumber>{analytics.productivityScore}</StatNumber>
            <StatLabel>Productivity Score</StatLabel>
            <StatTrend>+5% from last week</StatTrend>
          </StatCard>
          
          <StatCard variant="success">
            <StatIcon>✅</StatIcon>
            <StatNumber>{analytics.completedEvents}</StatNumber>
            <StatLabel>Completed Tasks</StatLabel>
            <StatTrend>{analytics.completionRate}% completion rate</StatTrend>
          </StatCard>
          
          <StatCard variant="warning">
            <StatIcon>⏳</StatIcon>
            <StatNumber>{analytics.pendingEvents}</StatNumber>
            <StatLabel>Pending Tasks</StatLabel>
            <StatTrend>Need attention</StatTrend>
          </StatCard>
          
          <StatCard variant="info">
            <StatIcon>⏰</StatIcon>
            <StatNumber>{Math.round(analytics.totalTimeLogged)}</StatNumber>
            <StatLabel>Hours Logged</StatLabel>
            <StatTrend>This {timeFilter}</StatTrend>
          </StatCard>
        </StatsGrid>
      </StatsSection>

      {/* Recent Activity */}
      <ActivitySection>
        <SectionTitle>📋 Recent Activity</SectionTitle>
        <ActivityList>
          <ActivityItem>
            <ActivityIcon>✅</ActivityIcon>
            <ActivityContent>
              <ActivityTitle>Completed: Project Review</ActivityTitle>
              <ActivityTime>2 hours ago</ActivityTime>
            </ActivityContent>
          </ActivityItem>
          <ActivityItem>
            <ActivityIcon>🔥</ActivityIcon>
            <ActivityContent>
              <ActivityTitle>High Priority: Client Meeting</ActivityTitle>
              <ActivityTime>4 hours ago</ActivityTime>
            </ActivityContent>
          </ActivityItem>
        </ActivityList>
      </ActivitySection>
    </>
  );

  const renderPerformanceMetrics = () => (
    <MetricsSection>
      <SectionTitle>🎯 Performance Metrics</SectionTitle>
      
      {/* KPI Cards */}
      <KPIGrid>
        <KPICard>
          <KPIHeader>
            <KPIIcon>⚡</KPIIcon>
            <KPITitle>Efficiency Rate</KPITitle>
          </KPIHeader>
          <KPIValue>{analytics.completionRate}%</KPIValue>
          <KPITrend positive={true}>+12% vs last period</KPITrend>
          <KPIChart>
            <ChartBar height={analytics.completionRate} />
          </KPIChart>
        </KPICard>

        <KPICard>
          <KPIHeader>
            <KPIIcon>📈</KPIIcon>
            <KPITitle>Productivity Trend</KPITitle>
          </KPIHeader>
          <KPIValue>{analytics.productivityScore}</KPIValue>
          <KPITrend positive={true}>+8% improvement</KPITrend>
          <TrendChart>
            {[65, 70, 68, 75, 80, 78, analytics.productivityScore].map((value, index) => (
              <TrendPoint key={index} height={value} />
            ))}
          </TrendChart>
        </KPICard>

        <KPICard>
          <KPIHeader>
            <KPIIcon>⏱️</KPIIcon>
            <KPITitle>Avg. Completion Time</KPITitle>
          </KPIHeader>
          <KPIValue>{Math.round(analytics.avgCompletionTime / (1000 * 60 * 60 * 24))}d</KPIValue>
          <KPITrend positive={false}>-2 days vs target</KPITrend>
        </KPICard>
      </KPIGrid>

      {/* Performance Chart */}
      <ChartContainer>
        <ChartTitle>Weekly Performance Analysis</ChartTitle>
        <PerformanceChart>
          {analytics.weeklyTimeDistribution.map((day, index) => (
            <ChartColumn key={day.day}>
              <ColumnBar height={(day.hours / 10) * 100} />
              <ColumnLabel>{day.day}</ColumnLabel>
              <ColumnValue>{day.hours}h</ColumnValue>
            </ChartColumn>
          ))}
        </PerformanceChart>
      </ChartContainer>
    </MetricsSection>
  );

  const renderTimeTracking = () => (
    <TimeSection>
      <SectionTitle>⏰ Time Tracking</SectionTitle>
      
      <TimeGrid>
        <TimeCard>
          <TimeHeader>
            <TimeIcon>📅</TimeIcon>
            <TimeTitle>Today's Summary</TimeTitle>
          </TimeHeader>
          <TimeStats>
            <TimeStat>
              <TimeStatLabel>Logged</TimeStatLabel>
              <TimeStatValue>6.5h</TimeStatValue>
            </TimeStat>
            <TimeStat>
              <TimeStatLabel>Productive</TimeStatLabel>
              <TimeStatValue>5.2h</TimeStatValue>
            </TimeStat>
            <TimeStat>
              <TimeStatLabel>Efficiency</TimeStatLabel>
              <TimeStatValue>80%</TimeStatValue>
            </TimeStat>
          </TimeStats>
        </TimeCard>

        <TimeCard>
          <TimeHeader>
            <TimeIcon>📊</TimeIcon>
            <TimeTitle>Time Distribution</TimeTitle>
          </TimeHeader>
          <TimeBreakdown>
            <BreakdownItem>
              <BreakdownColor color="#4285f4" />
              <BreakdownLabel>Development</BreakdownLabel>
              <BreakdownValue>4.2h</BreakdownValue>
            </BreakdownItem>
            <BreakdownItem>
              <BreakdownColor color="#34a853" />
              <BreakdownLabel>Meetings</BreakdownLabel>
              <BreakdownValue>1.5h</BreakdownValue>
            </BreakdownItem>
            <BreakdownItem>
              <BreakdownColor color="#fbbc04" />
              <BreakdownLabel>Planning</BreakdownLabel>
              <BreakdownValue>0.8h</BreakdownValue>
            </BreakdownItem>
          </TimeBreakdown>
        </TimeCard>
      </TimeGrid>

      <TimerSection>
        <TimerCard>
          <TimerDisplay>02:34:15</TimerDisplay>
          <TimerLabel>Current Session</TimerLabel>
          <TimerControls>
            <TimerButton variant="primary">⏸️ Pause</TimerButton>
            <TimerButton variant="secondary">⏹️ Stop</TimerButton>
          </TimerControls>
        </TimerCard>
      </TimerSection>
    </TimeSection>
  );

  const renderCustomReports = () => (
    <ReportsSection>
      <SectionTitle>📊 Custom Reports</SectionTitle>
      
      <ReportControls>
        <FilterGroup>
          <FilterLabel>Report Type:</FilterLabel>
          <FilterSelect value={reportType} onChange={(e) => setReportType(e.target.value as any)}>
            <option value="productivity">Productivity Analysis</option>
            <option value="time-analysis">Time Analysis</option>
            <option value="custom">Custom Report</option>
          </FilterSelect>
        </FilterGroup>
        
        <FilterGroup>
          <FilterLabel>Time Period:</FilterLabel>
          <FilterSelect value={timeFilter} onChange={(e) => setTimeFilter(e.target.value as any)}>
            <option value="today">Today</option>
            <option value="week">This Week</option>
            <option value="month">This Month</option>
            <option value="year">This Year</option>
          </FilterSelect>
        </FilterGroup>

        <ExportButton onClick={() => setShowExportModal(true)}>
          📥 Export Report
        </ExportButton>
      </ReportControls>

      <ReportPreview>
        <ReportTitle>{reportType.replace('-', ' ').toUpperCase()} REPORT</ReportTitle>
        <ReportContent>
          <ReportMetric>
            <MetricLabel>Total Events Analyzed</MetricLabel>
            <MetricValue>{analytics.totalEvents}</MetricValue>
          </ReportMetric>
          <ReportMetric>
            <MetricLabel>Completion Rate</MetricLabel>
            <MetricValue>{analytics.completionRate}%</MetricValue>
          </ReportMetric>
          <ReportMetric>
            <MetricLabel>Productivity Score</MetricLabel>
            <MetricValue>{analytics.productivityScore}/100</MetricValue>
          </ReportMetric>
        </ReportContent>
      </ReportPreview>

      {showExportModal && (
        <ExportModal>
          <ModalContent>
            <ModalTitle>Export Report</ModalTitle>
            <ExportOptions>
              <ExportOption onClick={() => handleExport({ format: 'pdf' })}>
                📄 PDF Report
              </ExportOption>
              <ExportOption onClick={() => handleExport({ format: 'csv' })}>
                📊 CSV Data
              </ExportOption>
              <ExportOption onClick={() => handleExport({ format: 'xlsx' })}>
                📈 Excel File
              </ExportOption>
              <ExportOption onClick={() => handleExport({ format: 'json' })}>
                💾 JSON Data
              </ExportOption>
            </ExportOptions>
            <ModalActions>
              <ModalButton onClick={() => setShowExportModal(false)}>Cancel</ModalButton>
            </ModalActions>
          </ModalContent>
        </ExportModal>
      )}
    </ReportsSection>
  );

  const renderGoalTracking = () => (
    <GoalsSection>
      <SectionTitle>🎯 Goal Setting & Tracking</SectionTitle>
      
      <GoalsGrid>
        {goals.map((goal) => (
          <GoalCard key={goal.id}>
            <GoalHeader>
              <GoalIcon>{goal.type === 'tasks' ? '📋' : goal.type === 'time' ? '⏰' : '🎯'}</GoalIcon>
              <GoalTitle>{goal.title}</GoalTitle>
            </GoalHeader>
            
            <GoalProgress>
              <ProgressValue>{goal.current} / {goal.target}</ProgressValue>
              <ProgressBar>
                <ProgressFill width={(goal.current / goal.target) * 100} />
              </ProgressBar>
              <ProgressPercentage>{Math.round((goal.current / goal.target) * 100)}%</ProgressPercentage>
            </GoalProgress>
            
            {goal.deadline && (
              <GoalDeadline>
                📅 Due: {goal.deadline.toLocaleDateString()}
              </GoalDeadline>
            )}
            
            <GoalStatus status={goal.current >= goal.target ? 'completed' : 'in-progress'}>
              {goal.current >= goal.target ? '✅ Completed' : '🔄 In Progress'}
            </GoalStatus>
          </GoalCard>
        ))}
      </GoalsGrid>

      <AddGoalButton>
        ➕ Add New Goal
      </AddGoalButton>
    </GoalsSection>
  );

  const getTimeOfDay = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
  };

  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <Title>
            <AnalyticsIcon>📊</AnalyticsIcon>
            Analytics Dashboard
          </Title>
          <Subtitle>
            Good {getTimeOfDay()}! Here's your productivity overview
          </Subtitle>
        </HeaderContent>
      </Header>

      {/* Navigation Tabs */}
      <TabNavigation>
        <TabButton 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </TabButton>
        <TabButton 
          active={activeTab === 'performance'} 
          onClick={() => setActiveTab('performance')}
        >
          🎯 Performance
        </TabButton>
        <TabButton 
          active={activeTab === 'time'} 
          onClick={() => setActiveTab('time')}
        >
          ⏰ Time Tracking
        </TabButton>
        <TabButton 
          active={activeTab === 'reports'} 
          onClick={() => setActiveTab('reports')}
        >
          📊 Reports
        </TabButton>
        <TabButton 
          active={activeTab === 'goals'} 
          onClick={() => setActiveTab('goals')}
        >
          🎯 Goals
        </TabButton>
      </TabNavigation>

      {/* Tab Content */}
      {renderTabContent()}

      {/* Empty State */}
      {analytics.totalEvents === 0 && (
        <EmptyState>
          <EmptyIcon>📋</EmptyIcon>
          <EmptyTitle>No Data Yet</EmptyTitle>
          <EmptyText>Start adding events and tasks to see your analytics!</EmptyText>
          <EmptySubtext>Your productivity insights will appear here once you have some data.</EmptySubtext>
        </EmptyState>
      )}
    </DashboardContainer>
  );
};

// Animations (keeping existing ones and adding new)
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const progressAnimation = keyframes`
  from { width: 0%; }
  to { width: var(--completion); }
`;

const pulse = keyframes`
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.05); }
`;

const shimmer = keyframes`
  0% { background-position: -200px 0; }
  100% { background-position: calc(200px + 100%) 0; }
`;

// Enhanced Styled Components
const DashboardContainer = styled.div`
  background: linear-gradient(135deg, #1a1a1a 0%, #2a2a2a 100%);
  border-radius: 16px;
  color: #fff;
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  box-shadow: 
    0 20px 40px rgba(0, 0, 0, 0.4),
    0 8px 16px rgba(0, 0, 0, 0.2),
    inset 0 1px 0 rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.1);
  overflow: hidden;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.div`
  background: linear-gradient(135deg, #1f1f1f 0%, #2f2f2f 100%);
  padding: 2rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const HeaderContent = styled.div`
  text-align: center;
`;

const Title = styled.h1`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin: 0 0 0.5rem 0;
  font-size: 2rem;
  font-weight: 700;
  background: linear-gradient(135deg, #fff 0%, #e0e0e0 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const AnalyticsIcon = styled.span`
  font-size: 2.5rem;
  filter: drop-shadow(0 2px 4px rgba(66, 133, 244, 0.3));
`;

const Subtitle = styled.p`
  margin: 0;
  font-size: 1.1rem;
  color: #888;
  font-weight: 400;
`;

// Tab Navigation
const TabNavigation = styled.div`
  display: flex;
  background: rgba(42, 42, 42, 0.6);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  overflow-x: auto;
`;

const TabButton = styled.button<{ active: boolean }>`
  background: ${({ active }) => active ? 'linear-gradient(135deg, #4285f4, #1976d2)' : 'transparent'};
  color: ${({ active }) => active ? '#fff' : '#888'};
  border: none;
  padding: 1rem 1.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  white-space: nowrap;
  border-bottom: 3px solid ${({ active }) => active ? '#4285f4' : 'transparent'};
  
  &:hover {
    background: ${({ active }) => active ? 'linear-gradient(135deg, #4285f4, #1976d2)' : 'rgba(66, 133, 244, 0.1)'};
    color: #fff;
  }
`;

// Existing styled components (keeping all from original)
const StatsSection = styled.section`
  padding: 2rem;
`;

const SectionTitle = styled.h2`
  margin: 0 0 1.5rem 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1rem;
  }
`;

const StatCard = styled.div<{ variant: 'primary' | 'success' | 'warning' | 'info' }>`
  background: ${({ variant }) => {
    const colors = {
      primary: 'linear-gradient(135deg, rgba(66, 133, 244, 0.1) 0%, rgba(66, 133, 244, 0.05) 100%)',
      success: 'linear-gradient(135deg, rgba(40, 167, 69, 0.1) 0%, rgba(40, 167, 69, 0.05) 100%)',
      warning: 'linear-gradient(135deg, rgba(255, 193, 7, 0.1) 0%, rgba(255, 193, 7, 0.05) 100%)',
      info: 'linear-gradient(135deg, rgba(23, 162, 184, 0.1) 0%, rgba(23, 162, 184, 0.05) 100%)'
    };
    return colors[variant];
  }};
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid ${({ variant }) => {
    const colors = {
      primary: 'rgba(66, 133, 244, 0.2)',
      success: 'rgba(40, 167, 69, 0.2)',
      warning: 'rgba(255, 193, 7, 0.2)',
      info: 'rgba(23, 162, 184, 0.2)'
    };
    return colors[variant];
  }};
  transition: all 0.3s ease;
  animation: ${slideIn} 0.4s ease-out;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
`;

const StatIcon = styled.span`
  font-size: 2rem;
  margin-bottom: 0.5rem;
  display: block;
`;

const StatNumber = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #4285f4;
  margin-bottom: 0.25rem;
  line-height: 1;
`;

const StatLabel = styled.div`
  font-size: 1rem;
  color: #fff;
  font-weight: 600;
  margin-bottom: 0.25rem;
`;

const StatTrend = styled.div`
  font-size: 0.8rem;
  color: #888;
  font-style: italic;
`;

// New styled components for enhanced features
const ActivitySection = styled.section`
  padding: 0 2rem 2rem 2rem;
`;

const ActivityList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ActivityItem = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  background: rgba(42, 42, 42, 0.6);
  padding: 1rem;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ActivityIcon = styled.span`
  font-size: 1.5rem;
`;

const ActivityContent = styled.div`
  flex: 1;
`;

const ActivityTitle = styled.div`
  font-weight: 600;
  color: #fff;
  margin-bottom: 0.25rem;
`;

const ActivityTime = styled.div`
  font-size: 0.8rem;
  color: #888;
`;

// Performance Metrics Components
const MetricsSection = styled.section`
  padding: 2rem;
`;

const KPIGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const KPICard = styled.div`
  background: rgba(42, 42, 42, 0.6);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const KPIHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const KPIIcon = styled.span`
  font-size: 1.5rem;
`;

const KPITitle = styled.h3`
  margin: 0;
  font-size: 1rem;
  color: #fff;
  font-weight: 600;
`;

const KPIValue = styled.div`
  font-size: 2.5rem;
  font-weight: bold;
  color: #4285f4;
  margin-bottom: 0.5rem;
`;

const KPITrend = styled.div<{ positive: boolean }>`
  font-size: 0.9rem;
  color: ${({ positive }) => positive ? '#28a745' : '#dc3545'};
  margin-bottom: 1rem;
`;

const KPIChart = styled.div`
  height: 40px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
`;

const ChartBar = styled.div<{ height: number }>`
  height: 100%;
  width: ${({ height }) => height}%;
  background: linear-gradient(90deg, #4285f4, #1976d2);
  transition: width 1s ease;
`;

const TrendChart = styled.div`
  display: flex;
  align-items: end;
  gap: 2px;
  height: 40px;
`;

const TrendPoint = styled.div<{ height: number }>`
  flex: 1;
  height: ${({ height }) => (height / 100) * 40}px;
  background: linear-gradient(to top, #4285f4, #64b5f6);
  border-radius: 2px;
  transition: height 0.8s ease;
`;

const ChartContainer = styled.div`
  background: rgba(42, 42, 42, 0.6);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ChartTitle = styled.h3`
  margin: 0 0 1rem 0;
  color: #fff;
  font-size: 1.1rem;
`;

const PerformanceChart = styled.div`
  display: flex;
  align-items: end;
  gap: 1rem;
  height: 200px;
  padding-top: 1rem;
`;

const ChartColumn = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
`;

const ColumnBar = styled.div<{ height: number }>`
  width: 100%;
  height: ${({ height }) => height}%;
  background: linear-gradient(to top, #4285f4, #64b5f6);
  border-radius: 4px 4px 0 0;
  transition: height 1s ease;
  min-height: 10px;
`;

const ColumnLabel = styled.div`
  font-size: 0.8rem;
  color: #888;
  font-weight: 600;
`;

const ColumnValue = styled.div`
  font-size: 0.7rem;
  color: #4285f4;
  font-weight: bold;
`;

// Time Tracking Components
const TimeSection = styled.section`
  padding: 2rem;
`;

const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const TimeCard = styled.div`
  background: rgba(42, 42, 42, 0.6);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const TimeHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
`;

const TimeIcon = styled.span`
  font-size: 1.5rem;
`;

const TimeTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 1rem;
`;

const TimeStats = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
`;

const TimeStat = styled.div`
  text-align: center;
`;

const TimeStatLabel = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.25rem;
`;

const TimeStatValue = styled.div`
  font-size: 1.5rem;
  font-weight: bold;
  color: #4285f4;
`;

const TimeBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const BreakdownItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const BreakdownColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ color }) => color};
`;

const BreakdownLabel = styled.div`
  flex: 1;
  color: #fff;
  font-size: 0.9rem;
`;

const BreakdownValue = styled.div`
  color: #4285f4;
  font-weight: bold;
  font-size: 0.9rem;
`;

const TimerSection = styled.div`
  display: flex;
  justify-content: center;
`;

const TimerCard = styled.div`
  background: rgba(42, 42, 42, 0.6);
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-align: center;
`;

const TimerDisplay = styled.div`
  font-size: 3rem;
  font-weight: bold;
  color: #4285f4;
  margin-bottom: 0.5rem;
  font-family: 'Courier New', monospace;
`;

const TimerLabel = styled.div`
  color: #888;
  margin-bottom: 1.5rem;
`;

const TimerControls = styled.div`
  display: flex;
  gap: 1rem;
  justify-content: center;
`;

const TimerButton = styled.button<{ variant: 'primary' | 'secondary' }>`
  background: ${({ variant }) => variant === 'primary' ? '#4285f4' : 'rgba(255, 255, 255, 0.1)'};
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  }
`;

// Reports Components
const ReportsSection = styled.section`
  padding: 2rem;
`;

const ReportControls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  align-items: center;
  flex-wrap: wrap;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const FilterLabel = styled.label`
  color: #fff;
  font-size: 0.9rem;
  font-weight: 600;
`;

const FilterSelect = styled.select`
  background: rgba(42, 42, 42, 0.8);
  color: #fff;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 6px;
  padding: 0.5rem;
  font-size: 0.9rem;
`;

const ExportButton = styled.button`
  background: #28a745;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: #218838;
    transform: translateY(-2px);
  }
`;

const ReportPreview = styled.div`
  background: rgba(42, 42, 42, 0.6);
  padding: 2rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
`;

const ReportTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #fff;
  font-size: 1.2rem;
  text-align: center;
  letter-spacing: 1px;
`;

const ReportContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
`;

const ReportMetric = styled.div`
  text-align: center;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 8px;
`;

const MetricLabel = styled.div`
  color: #888;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
`;

const MetricValue = styled.div`
  color: #4285f4;
  font-size: 1.5rem;
  font-weight: bold;
`;

// Export Modal Components
const ExportModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: #2a2a2a;
  padding: 2rem;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  max-width: 400px;
  width: 90%;
`;

const ModalTitle = styled.h3`
  margin: 0 0 1.5rem 0;
  color: #fff;
  text-align: center;
`;

const ExportOptions = styled.div`
  display: grid;
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ExportOption = styled.button`
  background: rgba(66, 133, 244, 0.1);
  color: #fff;
  border: 1px solid rgba(66, 133, 244, 0.3);
  padding: 1rem;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  
  &:hover {
    background: rgba(66, 133, 244, 0.2);
  }
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: center;
`;

const ModalButton = styled.button`
  background: #6c757d;
  color: #fff;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  cursor: pointer;
  
  &:hover {
    background: #5a6268;
  }
`;

// Goals Components
const GoalsSection = styled.section`
  padding: 2rem;
`;

const GoalsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const GoalCard = styled.div`
  background: rgba(42, 42, 42, 0.6);
  padding: 1.5rem;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(10px);
`;

const GoalHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 1rem;
`;

const GoalIcon = styled.span`
  font-size: 1.5rem;
`;

const GoalTitle = styled.h3`
  margin: 0;
  color: #fff;
  font-size: 1rem;
  font-weight: 600;
`;

const GoalProgress = styled.div`
  margin-bottom: 1rem;
`;

const ProgressValue = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const ProgressFill = styled.div<{ width: number }>`
  height: 100%;
  width: ${({ width }) => Math.min(width, 100)}%;
  background: linear-gradient(90deg, #4285f4, #1976d2);
  border-radius: 4px;
  transition: width 1s ease;
`;

const ProgressPercentage = styled.div`
  text-align: right;
  font-size: 0.9rem;
  color: #4285f4;
  font-weight: bold;
`;

const GoalDeadline = styled.div`
  font-size: 0.8rem;
  color: #888;
  margin-bottom: 0.5rem;
`;

const GoalStatus = styled.div<{ status: 'completed' | 'in-progress' }>`
  padding: 0.5rem;
  border-radius: 6px;
  text-align: center;
  font-size: 0.8rem;
  font-weight: 600;
  background: ${({ status }) => status === 'completed' ? 
    'rgba(40, 167, 69, 0.2)' : 'rgba(255, 193, 7, 0.2)'};
  color: ${({ status }) => status === 'completed' ? '#28a745' : '#ffc107'};
  border: 1px solid ${({ status }) => status === 'completed' ? 
    'rgba(40, 167, 69, 0.3)' : 'rgba(255, 193, 7, 0.3)'};
`;

const AddGoalButton = styled.button`
  width: 100%;
  background: rgba(66, 133, 244, 0.1);
  color: #4285f4;
  border: 2px dashed rgba(66, 133, 244, 0.3);
  padding: 1.5rem;
  border-radius: 12px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 600;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(66, 133, 244, 0.2);
    border-color: rgba(66, 133, 244, 0.5);
  }
`;

// Empty State (keeping original)
const EmptyState = styled.div`
  text-align: center;
  padding: 4rem 2rem;
  color: #666;
`;

const EmptyIcon = styled.div`
  font-size: 4rem;
  margin-bottom: 1rem;
  opacity: 0.5;
`;

const EmptyTitle = styled.h3`
  margin: 0 0 0.5rem 0;
  color: #888;
  font-weight: 600;
  font-size: 1.5rem;
`;

const EmptyText = styled.p`
  margin: 0 0 0.5rem 0;
  color: #666;
  font-size: 1.1rem;
`;

const EmptySubtext = styled.p`
  margin: 0;
  color: #555;
  font-size: 0.9rem;
`;

export default AnalyticsDashboard;