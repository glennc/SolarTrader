import { TimeSkipState } from '../models/time-skip-state';

/**
 * Main display view for the time skip interface showing ship visualization and stats
 */
export class MainDisplayView {
  private state: TimeSkipState;
  
  /**
   * Creates a new MainDisplayView.
   * @param state Reference to the TimeSkipState
   * @param timeSkipService Reference to the TimeSkipService (not used directly in this view)
   */
  constructor(
    state: TimeSkipState,
    _timeSkipService: any
  ) {
    this.state = state;
  }
  
  /**
   * Renders the main display view.
   */
  render(): HTMLElement {
    const mainDisplay = document.createElement('div');
    mainDisplay.className = 'main-display';
    
    // Add ship visualization
    mainDisplay.appendChild(this.createShipVisualization());
    
    // Add ship stats area
    mainDisplay.appendChild(this.createShipStats());
    
    return mainDisplay;
  }
  
  /**
   * Creates the ship visualization element.
   */
  private createShipVisualization(): HTMLElement {
    const shipVisuals = document.createElement('div');
    shipVisuals.className = 'ship-visuals';
    
    // Star field for animation
    const starField = document.createElement('div');
    starField.className = 'star-field';
    starField.id = 'starField';
    shipVisuals.appendChild(starField);
    
    // Ship model
    const shipModel = document.createElement('div');
    shipModel.className = 'ship-model';
    
    const shipBody = document.createElement('div');
    shipBody.className = 'ship-body';
    
    const shipEngine = document.createElement('div');
    shipEngine.className = 'ship-engine';
    shipBody.appendChild(shipEngine);
    
    const engineGlow = document.createElement('div');
    engineGlow.className = 'engine-glow';
    shipBody.appendChild(engineGlow);
    
    shipModel.appendChild(shipBody);
    shipVisuals.appendChild(shipModel);
    
    return shipVisuals;
  }
  
  /**
   * Creates the ship stats element.
   */
  private createShipStats(): HTMLElement {
    const shipStats = document.createElement('div');
    shipStats.className = 'ship-stats';
    
    // System status card
    shipStats.appendChild(this.createSystemCard());
    
    // Engine efficiency graph
    shipStats.appendChild(this.createEfficiencyCard());
    
    // Projected alerts
    const alertsCard = document.createElement('div');
    alertsCard.className = 'stat-card';
    alertsCard.id = 'projected-alerts-card';
    
    const alertsHeader = document.createElement('div');
    alertsHeader.className = 'stat-card-header';
    alertsHeader.textContent = 'PROJECTED ALERTS';
    alertsCard.appendChild(alertsHeader);
    
    // Alert rows will be populated by SystemMonitorView
    shipStats.appendChild(alertsCard);
    
    return shipStats;
  }
  
  /**
   * Creates the system status card.
   */
  private createSystemCard(): HTMLElement {
    const systemCard = document.createElement('div');
    systemCard.className = 'stat-card';
    
    const systemHeader = document.createElement('div');
    systemHeader.className = 'stat-card-header';
    systemHeader.textContent = 'SHIP SYSTEMS';
    systemCard.appendChild(systemHeader);
    
    const systemRows = [
      { label: 'POWER:', key: 'power' },
      { label: 'ENGINES:', key: 'engines' },
      { label: 'LIFE SUPPORT:', key: 'lifeSupport' },
      { label: 'FUEL:', key: 'fuel' }
    ];
    
    systemRows.forEach(system => {
      const row = document.createElement('div');
      row.className = 'stat-row';
      
      const label = document.createElement('span');
      label.className = 'stat-label';
      label.textContent = system.label;
      row.appendChild(label);
      
      const value = document.createElement('span');
      value.className = 'stat-value';
      value.id = `system-${system.key}`;
      
      // Add warning class if below 80%
      if (this.state.shipSystemStates[system.key] < 80) {
        value.classList.add('stat-warn');
      }
      
      value.textContent = `${Math.round(this.state.shipSystemStates[system.key])}%`;
      row.appendChild(value);
      
      systemCard.appendChild(row);
    });
    
    return systemCard;
  }
  
  /**
   * Creates the engine efficiency graph card.
   */
  private createEfficiencyCard(): HTMLElement {
    const efficiencyCard = document.createElement('div');
    efficiencyCard.className = 'stat-card';
    
    const efficiencyHeader = document.createElement('div');
    efficiencyHeader.className = 'stat-card-header';
    efficiencyHeader.textContent = 'ENGINE EFFICIENCY';
    efficiencyCard.appendChild(efficiencyHeader);
    
    const graphContainer = document.createElement('div');
    graphContainer.className = 'stat-graph';
    
    const yAxis = document.createElement('div');
    yAxis.className = 'graph-y-axis';
    graphContainer.appendChild(yAxis);
    
    const xAxis = document.createElement('div');
    xAxis.className = 'graph-x-axis';
    graphContainer.appendChild(xAxis);
    
    // SVG for graph
    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('class', 'graph-line');
    svg.setAttribute('viewBox', '0 0 100 100');
    svg.setAttribute('preserveAspectRatio', 'none');
    
    // Path for line
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', 'M0,50 L10,52 L20,48 L30,53 L40,45 L50,47 L60,44 L70,48 L80,42 L90,46 L100,43');
    path.setAttribute('class', 'graph-path');
    svg.appendChild(path);
    
    // Path for fill
    const fillPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    fillPath.setAttribute('d', 'M0,50 L10,52 L20,48 L30,53 L40,45 L50,47 L60,44 L70,48 L80,42 L90,46 L100,43 L100,100 L0,100 Z');
    fillPath.setAttribute('class', 'graph-path-fill');
    svg.appendChild(fillPath);
    
    graphContainer.appendChild(svg);
    
    // Graph labels
    const startLabel = document.createElement('div');
    startLabel.className = 'graph-label';
    startLabel.style.bottom = '0';
    startLabel.style.left = '10px';
    startLabel.textContent = '0h';
    graphContainer.appendChild(startLabel);
    
    const endLabel = document.createElement('div');
    endLabel.className = 'graph-label';
    endLabel.style.bottom = '0';
    endLabel.style.right = '10px';
    endLabel.id = 'graph-end-time';
    endLabel.textContent = `${this.state.selectedSkipHours}h`;
    graphContainer.appendChild(endLabel);
    
    efficiencyCard.appendChild(graphContainer);
    
    return efficiencyCard;
  }
}