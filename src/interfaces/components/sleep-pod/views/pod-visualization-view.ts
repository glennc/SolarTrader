import { SleepPodState } from '../models/sleep-pod-state';
import { SleepService } from '../services/sleep-service';

/**
 * View for displaying the sleep pod visualization and vitals
 */
export class PodVisualizationView {
  private state: SleepPodState;
  private onStartSleep: () => void;
  private onExitInterface: () => void;
  
  constructor(
    state: SleepPodState, 
    _sleepService: SleepService, // Using underscore prefix to indicate unused parameter
    onStartSleep: () => void,
    onExitInterface: () => void
  ) {
    this.state = state;
    this.onStartSleep = onStartSleep;
    this.onExitInterface = onExitInterface;
  }
  
  /**
   * Creates the pod visualization element.
   */
  render(): HTMLElement {
    const podVis = document.createElement('div');
    podVis.className = 'sleep-pod-visualization';
    
    // Pod header
    const podHeader = document.createElement('div');
    podHeader.className = 'pod-header';
    
    const headerText = document.createElement('span');
    headerText.textContent = 'POD VISUALIZATION';
    podHeader.appendChild(headerText);
    
    const statusText = document.createElement('span');
    statusText.id = 'pod-status-text';
    statusText.className = 'status-value optimal';
    statusText.textContent = 'READY FOR SLEEP CYCLE';
    podHeader.appendChild(statusText);
    
    podVis.appendChild(podHeader);
    
    // Pod animation container
    const animationContainer = document.createElement('div');
    animationContainer.className = 'pod-animation-container';
    
    // Sleep pod
    const sleepPod = document.createElement('div');
    sleepPod.className = 'sleep-pod';
    
    // Pod interior
    const podInterior = document.createElement('div');
    podInterior.className = 'pod-interior';
    
    // Pod person
    const podPerson = document.createElement('div');
    podPerson.className = 'pod-person';
    podInterior.appendChild(podPerson);
    
    // Pod controls
    const podControls = document.createElement('div');
    podControls.className = 'pod-controls';
    podInterior.appendChild(podControls);
    
    // Pod display
    const podDisplay = document.createElement('div');
    podDisplay.className = 'pod-display';
    podDisplay.textContent = `REST: ${Math.round(this.state.playerRestLevel)}%`;
    podInterior.appendChild(podDisplay);
    
    // Pod lights
    for (let i = 1; i <= 4; i++) {
      const light = document.createElement('div');
      light.className = `pod-light pod-light-${i}`;
      podInterior.appendChild(light);
    }
    
    sleepPod.appendChild(podInterior);
    
    // Pod environment
    const podEnv = document.createElement('div');
    podEnv.className = 'pod-environment';
    
    // Sleep wave
    const sleepWave = document.createElement('div');
    sleepWave.className = 'sleep-wave';
    podEnv.appendChild(sleepWave);
    
    sleepPod.appendChild(podEnv);
    animationContainer.appendChild(sleepPod);
    podVis.appendChild(animationContainer);
    
    // Vitals container
    podVis.appendChild(this.createVitalsContainer());
    
    // Button container
    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';
    
    const sleepButton = document.createElement('div');
    sleepButton.className = 'sleep-button';
    sleepButton.id = 'sleep-button';
    sleepButton.textContent = 'INITIATE SLEEP CYCLE';
    sleepButton.addEventListener('click', () => this.onStartSleep());
    buttonContainer.appendChild(sleepButton);
    
    const cancelButton = document.createElement('div');
    cancelButton.className = 'cancel-button';
    cancelButton.textContent = 'CANCEL';
    cancelButton.addEventListener('click', () => this.onExitInterface());
    buttonContainer.appendChild(cancelButton);
    
    podVis.appendChild(buttonContainer);
    
    return podVis;
  }
  
  /**
   * Creates the vitals container element.
   */
  private createVitalsContainer(): HTMLElement {
    const vitalsContainer = document.createElement('div');
    vitalsContainer.className = 'vitals-container';
    
    // Heart rate monitor
    const heartMonitor = document.createElement('div');
    heartMonitor.className = 'vital-monitor';
    
    const heartHeader = document.createElement('div');
    heartHeader.className = 'vital-header';
    heartHeader.textContent = 'HEART RATE';
    heartMonitor.appendChild(heartHeader);
    
    const heartGraph = document.createElement('div');
    heartGraph.className = 'vital-graph';
    
    // SVG for heart rate
    const heartSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    heartSvg.setAttribute('class', 'heart-rate-line');
    heartSvg.setAttribute('viewBox', '0 0 100 100');
    heartSvg.setAttribute('preserveAspectRatio', 'none');
    
    const heartPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    heartPath.setAttribute('d', 'M0,50 L8,50 L10,20 L12,80 L14,50 L20,50 L22,50 L24,20 L26,80 L28,50 L34,50 L36,50 L38,20 L40,80 L42,50 L48,50 L50,50 L52,20 L54,80 L56,50 L62,50 L64,50 L66,20 L68,80 L70,50 L76,50 L78,50 L80,20 L82,80 L84,50 L90,50 L92,50 L94,20 L96,80 L98,50 L100,50');
    heartPath.setAttribute('stroke', 'rgba(85, 255, 170, 0.8)');
    heartPath.setAttribute('stroke-width', '1.5');
    heartPath.setAttribute('fill', 'none');
    
    heartSvg.appendChild(heartPath);
    heartGraph.appendChild(heartSvg);
    heartMonitor.appendChild(heartGraph);
    
    const heartValue = document.createElement('div');
    heartValue.className = 'vital-value heart-rate';
    heartValue.id = 'heart-rate-value';
    heartValue.textContent = `${this.state.vitalSigns.heartRate} BPM`;
    heartMonitor.appendChild(heartValue);
    
    vitalsContainer.appendChild(heartMonitor);
    
    // Brain activity monitor
    const brainMonitor = document.createElement('div');
    brainMonitor.className = 'vital-monitor';
    
    const brainHeader = document.createElement('div');
    brainHeader.className = 'vital-header';
    brainHeader.textContent = 'BRAIN ACTIVITY';
    brainMonitor.appendChild(brainHeader);
    
    const brainGraph = document.createElement('div');
    brainGraph.className = 'vital-graph';
    
    // SVG for brain activity
    const brainSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    brainSvg.setAttribute('class', 'brain-wave-line');
    brainSvg.setAttribute('viewBox', '0 0 100 100');
    brainSvg.setAttribute('preserveAspectRatio', 'none');
    
    const brainPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    brainPath.setAttribute('d', 'M0,50 C5,40 10,60 15,50 C20,40 25,60 30,50 C35,40 40,60 45,50 C50,40 55,60 60,50 C65,40 70,60 75,50 C80,40 85,60 90,50 C95,40 100,60 100,50');
    brainPath.setAttribute('stroke', 'rgba(51, 204, 255, 0.8)');
    brainPath.setAttribute('stroke-width', '1.5');
    brainPath.setAttribute('fill', 'none');
    
    brainSvg.appendChild(brainPath);
    brainGraph.appendChild(brainSvg);
    brainMonitor.appendChild(brainGraph);
    
    const brainValue = document.createElement('div');
    brainValue.className = 'vital-value brain-activity';
    brainValue.id = 'brain-activity-value';
    brainValue.textContent = this.state.vitalSigns.brainActivity;
    brainMonitor.appendChild(brainValue);
    
    vitalsContainer.appendChild(brainMonitor);
    
    // Rest quality monitor
    const restMonitor = document.createElement('div');
    restMonitor.className = 'vital-monitor';
    
    const restHeader = document.createElement('div');
    restHeader.className = 'vital-header';
    restHeader.textContent = 'REST QUALITY';
    restMonitor.appendChild(restHeader);
    
    const restGraph = document.createElement('div');
    restGraph.className = 'vital-graph';
    
    // SVG for rest quality
    const restSvg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    restSvg.setAttribute('class', 'brain-wave-line');
    restSvg.setAttribute('viewBox', '0 0 100 100');
    restSvg.setAttribute('preserveAspectRatio', 'none');
    
    const rectValues = [
      { x: 0, y: 30, width: 20, height: 40, fill: 'rgba(85, 255, 170, 0.4)' },
      { x: 20, y: 20, width: 20, height: 60, fill: 'rgba(85, 255, 170, 0.5)' },
      { x: 40, y: 10, width: 20, height: 80, fill: 'rgba(85, 255, 170, 0.6)' },
      { x: 60, y: 10, width: 20, height: 80, fill: 'rgba(85, 255, 170, 0.7)' },
      { x: 80, y: 5, width: 20, height: 90, fill: 'rgba(85, 255, 170, 0.8)' }
    ];
    
    rectValues.forEach(rect => {
      const rectElem = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
      rectElem.setAttribute('x', rect.x.toString());
      rectElem.setAttribute('y', rect.y.toString());
      rectElem.setAttribute('width', rect.width.toString());
      rectElem.setAttribute('height', rect.height.toString());
      rectElem.setAttribute('fill', rect.fill);
      restSvg.appendChild(rectElem);
    });
    
    restGraph.appendChild(restSvg);
    restMonitor.appendChild(restGraph);
    
    const restValue = document.createElement('div');
    restValue.className = 'vital-value rest-quality';
    restValue.id = 'rest-quality-value';
    restValue.textContent = this.state.vitalSigns.restQuality;
    restMonitor.appendChild(restValue);
    
    vitalsContainer.appendChild(restMonitor);
    
    return vitalsContainer;
  }
  
  /**
   * Updates the UI for sleep start.
   */
  updateUIForSleepStart(): void {
    const sleepButton = document.getElementById('sleep-button');
    if (sleepButton) {
      sleepButton.textContent = 'SLEEP IN PROGRESS...';
      sleepButton.classList.add('active');
    }
    
    const statusText = document.getElementById('pod-status-text');
    if (statusText) {
      statusText.textContent = 'SLEEP CYCLE ACTIVE';
    }
    
    const sleepPod = document.querySelector('.sleep-pod');
    if (sleepPod) {
      sleepPod.classList.add('active');
    }
  }
  
  /**
   * Updates the UI for sleep completion.
   */
  updateUIForSleepComplete(): void {
    const sleepButton = document.getElementById('sleep-button');
    if (sleepButton) {
      sleepButton.textContent = 'INITIATE SLEEP CYCLE';
      sleepButton.classList.remove('active');
    }
    
    const statusText = document.getElementById('pod-status-text');
    if (statusText) {
      statusText.textContent = 'SLEEP CYCLE COMPLETE';
    }
    
    const sleepPod = document.querySelector('.sleep-pod');
    if (sleepPod) {
      sleepPod.classList.remove('active');
    }
    
    // Update rest level display
    const restLevelElement = document.getElementById('player-rest-level');
    if (restLevelElement) {
      // Set appropriate class based on rest level
      if (this.state.playerRestLevel > 70) {
        restLevelElement.className = 'status-value optimal';
      } else if (this.state.playerRestLevel > 40) {
        restLevelElement.className = 'status-value warning';
      } else {
        restLevelElement.className = 'status-value danger';
      }
      
      restLevelElement.textContent = `REST: ${Math.round(this.state.playerRestLevel)}%`;
    }
    
    // Update pod display
    const podDisplay = document.querySelector('.pod-display');
    if (podDisplay) {
      podDisplay.textContent = `REST: ${Math.round(this.state.playerRestLevel)}%`;
    }
    
    // Update vital signs displays
    this.updateVitalDisplays();
  }
  
  /**
   * Updates the progress display element.
   */
  updateProgressDisplay(progress: number): void {
    // Find the pod display and update it
    const podDisplay = document.querySelector('.pod-display');
    if (podDisplay) {
      const percent = Math.round(progress * 100);
      podDisplay.textContent = `SLEEP: ${percent}%`;
    }
    
    // Calculate time remaining and update
    const totalSleepMs = this.state.sleepConfig.selectedHours * 60 * 60 * 1000;
    const remainingMs = totalSleepMs * (1 - progress);
    
    // Format time remaining as hours:minutes
    const hoursRemaining = Math.floor(remainingMs / (60 * 60 * 1000));
    const minutesRemaining = Math.floor((remainingMs % (60 * 60 * 1000)) / (60 * 1000));
    
    const statusText = document.getElementById('pod-status-text');
    if (statusText) {
      statusText.textContent = `REMAINING: ${hoursRemaining}h ${minutesRemaining}m`;
    }
    
    // Update vital displays
    this.updateVitalDisplays();
    
    // Update pod environment
    this.updatePodEnvironment(progress);
  }
  
  /**
   * Updates the vital sign displays.
   */
  private updateVitalDisplays(): void {
    const heartRateElement = document.getElementById('heart-rate-value');
    if (heartRateElement) {
      heartRateElement.textContent = `${this.state.vitalSigns.heartRate} BPM`;
    }
    
    const brainActivityElement = document.getElementById('brain-activity-value');
    if (brainActivityElement) {
      brainActivityElement.textContent = this.state.vitalSigns.brainActivity;
    }
    
    const restQualityElement = document.getElementById('rest-quality-value');
    if (restQualityElement) {
      restQualityElement.textContent = this.state.vitalSigns.restQuality;
    }
  }
  
  /**
   * Updates the pod environment visuals based on sleep progress.
   */
  private updatePodEnvironment(progress: number): void {
    // Update sleep wave animation
    const sleepWave = document.querySelector('.sleep-wave');
    if (sleepWave) {
      // Adjust the wave animation based on sleep phase
      if (progress < 0.3) {
        sleepWave.className = 'sleep-wave falling-asleep';
      } else if (progress < 0.8) {
        sleepWave.className = 'sleep-wave deep-sleep';
      } else {
        sleepWave.className = 'sleep-wave waking-up';
      }
    }
    
    // Update pod lights
    const lights = document.querySelectorAll('.pod-light');
    lights.forEach((light, index) => {
      // Create a pulsing effect with different phases for each light
      const opacity = 0.3 + Math.sin((progress * 10) + (index * 0.5)) * 0.3;
      (light as HTMLElement).style.opacity = opacity.toString();
    });
  }
}