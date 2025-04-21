# SolarClipper - Next Steps for MVP

This document outlines the prioritized tasks to create a minimum viable product (MVP) for SolarClipper where the ship starts traveling, time advances, and the game ends when the ship reaches its destination.

## 1. Core Game Systems

### 1.1 Time System
- [ ] Implement `src/managers/time-manager.ts` with:
  - Game clock that advances in real-time with configurable acceleration rates
  - Support for time-skip functionality (using time_skip_mockup.htm as reference)
  - Day/night cycle tracking with appropriate UI indicators
  - Methods for systems to register time-dependent events
- [ ] Create time display component that shows both elapsed time and ETA to destination
- [ ] Add `terminal-time` class animations for all time displays across different interfaces
- [ ] Implement event scheduling in `src/managers/event-manager.ts` that triggers:
  - Random technical failures based on time and system condition
  - Space phenomena that affect ship systems
  - Personal events (dreams, memories, messages)

### 1.2 Travel System
- [ ] Define star map data in `src/data/location-definitions.ts` with:
  - Origin (Earth Orbital Station)
  - Destination (Alpha Centauri - fixed and cannot be changed during transit)
  - Intermediate navigation points
  - Distance calculations based on light years
- [ ] Implement travel mechanics in `src/systems/propulsion.ts` with:
  - Velocity calculations (shown as fraction of light speed)
  - Fuel consumption rate based on speed and engine condition
  - Connection to power systems for energy requirements
- [ ] Create `src/core/navigation.ts` for:
  - ETA calculations based on current velocity
  - Course adjustment mechanics (for optimization, not destination changes)
  - Distance remaining calculations
- [ ] Add visual journey progress indicators:
  - Progress bar on bridge interface (as in navigation_control_mockup.htm)
  - Star field visualization with ship position
  - Current position/destination markers

### 1.3 Game State Management
- [ ] Implement initial game state in `src/core/game-state.ts` that:
  - Initializes ship already in transit as per brief.md
  - Sets up initial system conditions (some with minor issues to address)
  - Establishes player starting needs values
- [ ] Create destination arrival detection in `src/managers/world-manager.ts` that:
  - Monitors distance remaining
  - Triggers end-game sequence when arriving
  - Calculates final score based on efficiency metrics
- [ ] Implement failure state detection for:
  - Critical life support failures
  - Catastrophic engine failures
  - Fuel depletion scenarios
  - Multiple cascading system failures
- [ ] Add emergency SOS system that:
  - Can be triggered by player in desperate situations
  - Ends the game with rescue scenario flavor text
  - Records final score with "rescued" status
- [ ] Add game state persistence using localStorage for:
  - Saving current position, system states, and resource levels
  - Preserving player needs and inventory
  - Storing maintenance history and event logs
- [ ] Implement efficiency scoring based on:
  - Fuel usage relative to optimal consumption
  - Power distribution efficiency
  - System maintenance timing and quality
  - Cargo integrity maintenance

## 2. Engine Room Implementation

### 2.1 Engine Core Systems
- [ ] Implement reactor system in `src/systems/power.ts` with:
  - Heat generation that increases with power output
  - Cooling system that connects to the engine coolant mechanics
  - Efficiency curves that depend on operating temperature
  - Risk of damage when operating outside optimal ranges
- [ ] Create fuel consumption logic in `src/systems/propulsion.ts` that:
  - Depletes fuel resources over time based on power settings
  - Calculates optimal consumption rates versus actual usage
  - Implements warning thresholds for fuel levels
  - Connects to the ship's velocity calculations
- [ ] Add power monitoring interface in `src/interfaces/systems/power-control.ts` inspired by:
  - The engineering interface mockup from brief.md
  - The diagnostics interface in system_diagnostics_mockup.htm
- [ ] Implement engine efficiency calculations based on:
  - Current heat levels vs. optimal range
  - Coolant pressure and flow rates
  - Component wear and maintenance status
  - Power input versus thrust output ratios

### 2.2 Engine Maintenance
- [ ] Create component wear system in `src/systems/base-system.ts` that:
  - Gradually decreases component effectiveness over time
  - Accelerates degradation when operating outside optimal parameters
  - Affects system performance in realistic ways
  - Requires regular maintenance based on scheduled intervals
- [ ] Implement repair mechanics in `src/interfaces/systems/maintenance.ts` allowing:
  - Diagnostic scans to identify issues
  - Component replacement using inventory parts
  - Adjustments to improve efficiency
  - Emergency repairs during critical failures
- [ ] Add emergency procedure triggers in `src/managers/event-manager.ts` for:
  - Coolant system failures (as shown in first_person_mockup.htm)
  - Power surges and distribution failures
  - Engine overheating scenarios
  - Cascading system failures
- [ ] Create inventory system for spare parts in `src/core/ship.ts` including:
  - Limited storage space for critical components
  - Condition tracking for salvaged parts
  - Usage logging for maintenance history
  - Consumption mechanisms when performing repairs

### 2.3 Energy Distribution
- [ ] Implement power grid in `src/systems/power.ts` with:
  - Connection points to all major ship systems
  - Power demand calculations based on system activity
  - Maximum generation capacity affected by reactor condition
  - Efficiency losses in the distribution network
- [ ] Create power allocation interface in `src/interfaces/systems/power-distribution.ts` based on:
  - The engineering systems mockup in brief.md
  - Slider or percentage-based controls for each system
  - Visual feedback for power flow and demand
- [ ] Add power prioritization logic with:
  - Critical systems that cannot be completely depowered
  - Automatic reallocation during emergencies
  - Performance degradation when underpowered
  - Efficiency bonuses for optimal distribution
- [ ] Implement cascading failure effects:
  - Power loss triggering life support degradation
  - Coolant failure causing engine shutdown
  - Navigation errors when sensors are underpowered
  - Communication disruptions affecting event triggers

## 3. Bridge Diagnostics Screen

### 3.1 Ship Status Overview
- [ ] Enhance `src/interfaces/systems/diagnostics/views/overview-view.ts` to include:
  - System status cards matching system_diagnostics_mockup.htm
  - Color-coded status indicators (good, warning, danger)
  - Real-time updating metrics for key systems
  - Maintenance alert section with prioritized issues
- [ ] Create ship health calculation in `src/core/ship.ts` that:
  - Aggregates status from all major systems
  - Weights critical systems more heavily
  - Factors in remaining consumable resources
  - Considers maintenance backlog
- [ ] Add alert system using established classes:
  - `.status-warning` for issues requiring attention
  - `.status-danger` for critical problems
  - Alert dismissal functionality
  - Time-stamped alert logging
- [ ] Implement statistics panel with:
  - Power efficiency percentages
  - Fuel consumption rates versus optimal
  - Coolant pressure and temperature charts
  - System uptime statistics

### 3.2 Navigation Interface
- [ ] Create course display component based on navigation_control_mockup.htm with:
  - Interactive star map visualization
  - Current position, origin, and destination markers
  - Route visualization with checkpoint markers
  - ETA and distance remaining indicator
- [ ] Implement minor course adjustment mechanics:
  - Optimize for fuel efficiency or speed
  - Avoid hazards that appear during journey
  - Stabilize route during system fluctuations
  - Cannot change final destination
- [ ] Implement ETA and distance indicators using:
  - Real-time updates based on current velocity
  - Visual countdown timer for arrival
  - Distance remaining in light years
  - Time estimation adjustment when speed changes
- [ ] Add proximity warning system for:
  - Celestial objects requiring course adjustments
  - Space phenomena that affect ship systems
  - Jump points and navigation hazards
  - Using `.alert-message` styling from mockups
- [ ] Create navigation log in `src/interfaces/systems/navigation-log.ts` that:
  - Records all course adjustments
  - Tracks velocity changes
  - Notes space phenomena encounters
  - Shows fuel efficiency during different segments

### 3.3 Emergency Systems
- [ ] Implement emergency protocols interface in `src/interfaces/systems/emergency-systems.ts`:
  - System shutdown procedures for containing damage
  - Emergency power allocation
  - Distress signal transmission system
  - Final log recording functionality
- [ ] Create SOS transmission interface with:
  - Signal strength calculator based on location
  - Emergency message encoding
  - Success probability estimation
  - Game ending sequence with rescue scenario

## 4. User Interface Enhancements

### 4.1 Interface Polish
- [ ] Ensure consistent styling across interfaces by:
  - Creating base component styles in `css/system-interfaces.css`
  - Implementing shared color variables for status indication
  - Standardizing layout patterns for similar interfaces
  - Maintaining consistent typography and spacing
- [ ] Implement terminal effects from mockups:
  - Scanlines effect using `:before` pseudo-elements
  - Screen flicker animations
  - CRT-style rendering artifacts
  - Subtle glow effects for important elements
- [ ] Add tooltips for:
  - Complex engineering controls
  - System status indicators
  - Navigation interface elements
  - Maintenance action buttons
- [ ] Create feedback animations for:
  - Button presses and interactions
  - Status changes and alerts
  - System diagnostics running
  - Sleep pod activation (as in slep_pod_mockup.htm)

### 4.2 Audio Feedback
- [ ] Add ambient engine sounds:
  - Base hum that changes with power output
  - Warning tones for overheating
  - Coolant system sounds
  - Power distribution hums
- [ ] Implement alert sounds:
  - Different tones for warning vs. danger
  - Escalating urgency for unaddressed issues
  - Confirmation tones for completed actions
  - System startup and shutdown sequences
- [ ] Create UI interaction sounds:
  - Button clicks and toggles
  - Interface navigation feedback
  - Typing sounds for command input
  - Diagnostic scan audio effects
- [ ] Add background ambient tracks:
  - Different themes for various ship compartments
  - Dynamic mixing based on system status
  - Sleep-specific calming audio
  - Special audio for emergency situations

## 5. Integration and Testing

### 5.1 System Integration
- [ ] Connect all game systems through an event system that:
  - Allows systems to subscribe to relevant events
  - Broadcasts changes that might affect multiple systems
  - Maintains loose coupling between components
  - Provides debugging tools to track event flow
- [ ] Ensure proper data flow between components using manager classes:
  - `WorldManager` handling location and player movement
  - `TimeManager` coordinating time-dependent processes
  - `EventManager` triggering appropriate events
  - `InterfaceManager` switching between UI views
- [ ] Create debugging tools for:
  - System state inspection panels
  - Time acceleration/deceleration controls
  - Event triggering and logging
  - Interface switching shortcuts
- [ ] Implement proper component lifecycle following conventions:
  - Loading and unloading CSS on interface transitions
  - Clean removal of event listeners when needed
  - Memory management for UI components
  - Proper suspension and resumption of systems

### 5.2 Testing and Balancing
- [ ] Test core gameplay loop ensuring:
  - Daily routines feel purposeful not tedious
  - System maintenance creates interesting decisions
  - Event responses provide meaningful challenges
  - Failure states create appropriate tension
- [ ] Balance system difficulty:
  - Degradation rates provide challenge without overwhelm
  - Resource consumption creates meaningful constraints
  - Time management feels tight but achievable
  - Maintenance tasks require attention but aren't constant
- [ ] Implement progressive challenge scaling:
  - Start with stable systems that gradually develop issues
  - Increase complexity of failures over time
  - Layer multiple issues to test player prioritization
  - Create occasional critical situations that test mastery
- [ ] Design and test failure states:
  - Balance frequency of potentially game-ending failures
  - Ensure adequate warning before critical failures
  - Provide meaningful recovery options for skilled players
  - Make emergency SOS a viable but suboptimal solution

## First Implementation Sprint

Focus on implementing these core files first:

1. `src/managers/time-manager.ts` - Time advancement with acceleration options
2. `src/core/ship.ts` - Ship state with position, destination, and system references
3. `src/systems/power.ts` - Power generation and distribution to ship systems
4. `src/systems/propulsion.ts` - Engine mechanics with fuel consumption and velocity
5. `src/interfaces/systems/diagnostics/views/overview-view.ts` - Enhanced diagnostics UI
6. `src/core/game-state.ts` - Initial state setup and arrival/failure detection
7. `src/managers/event-manager.ts` - Basic event scheduling and triggering
8. `src/interfaces/systems/power-control.ts` - Power monitoring and control interface
9. `src/interfaces/systems/emergency-systems.ts` - Basic emergency protocols including SOS

These implementations will create the foundation for a playable MVP where the player manages the ship's engine and power systems during an interstellar journey, with appropriate feedback through the diagnostics screen, culminating in either successful arrival at the destination or emergency rescue if systems catastrophically fail.
