/**
 * Municipal Foundations World (World 1)
 * Introduction to municipal administration and processes
 * Building on Q2 game patterns with Q3 multi-world progression
 */

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { gameStateManager } from '../services/game-state-manager';
import { multiWorldStateManager } from '../services/multi-world-state-manager';
import { WorldHubState } from '../types/q3-multi-world';
import { DialogueScene } from '../components/DialogueScene/DialogueScene';
import './MunicipalFoundationsWorld.css';

interface MunicipalFoundationsWorldProps {
  hubSessionId: string;
  uniqueCode: string;
  culturalContext: 'swedish_municipal' | 'german_municipal' | 'french_municipal' | 'dutch_municipal';
}

export const MunicipalFoundationsWorld: React.FC<MunicipalFoundationsWorldProps> = ({
  hubSessionId,
  uniqueCode,
  culturalContext
}) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [worldState, setWorldState] = useState<any>(null);
  const [currentScenario, setCurrentScenario] = useState(0);
  const [startTime] = useState(Date.now());

  // Municipal Foundations scenarios
  const scenarios = [
    {
      id: 'municipal-intro',
      title: getCulturalText('municipal_intro_title'),
      description: getCulturalText('municipal_intro_desc'),
      type: 'introduction',
      mechanics: ['dialogue', 'information_absorption'],
      competencyFocus: ['municipal_administration'],
      estimatedTime: 8 // minutes
    },
    {
      id: 'org-structure',
      title: getCulturalText('org_structure_title'),
      description: getCulturalText('org_structure_desc'),
      type: 'exploration',
      mechanics: ['drag_drop_workflows', 'branching_narratives'],
      competencyFocus: ['municipal_administration', 'compliance_knowledge'],
      estimatedTime: 12 // minutes
    },
    {
      id: 'citizen-services-basics',
      title: getCulturalText('citizen_services_title'),
      description: getCulturalText('citizen_services_desc'),
      type: 'practice',
      mechanics: ['character_relationships', 'achievement_system'],
      competencyFocus: ['citizen_service_excellence', 'cultural_adaptation'],
      estimatedTime: 15 // minutes
    },
    {
      id: 'compliance-intro',
      title: getCulturalText('compliance_intro_title'),
      description: getCulturalText('compliance_intro_desc'),
      type: 'assessment',
      mechanics: ['timed_challenges', 'branching_narratives'],
      competencyFocus: ['compliance_knowledge', 'municipal_administration'],
      estimatedTime: 10 // minutes
    }
  ];

  function getCulturalText(key: string): string {
    const texts = {
      swedish_municipal: {
        municipal_intro_title: 'Välkommen till Kommunala Grunder',
        municipal_intro_desc: 'Lär dig grunderna i svensk kommunal förvaltning',
        org_structure_title: 'Kommunal Organisation',
        org_structure_desc: 'Utforska hur svenska kommuner är organiserade',
        citizen_services_title: 'Grundläggande Medborgartjänster',
        citizen_services_desc: 'Förstå hur vi tjänar våra medborgare',
        compliance_intro_title: 'Regelefterlevnad och Processer',
        compliance_intro_desc: 'Viktiga regler och processer för kommunalt arbete'
      },
      german_municipal: {
        municipal_intro_title: 'Willkommen zu Kommunalen Grundlagen',
        municipal_intro_desc: 'Lernen Sie die Grundlagen der deutschen Kommunalverwaltung',
        org_structure_title: 'Kommunale Organisation',
        org_structure_desc: 'Erkunden Sie die Organisation deutscher Kommunen',
        citizen_services_title: 'Grundlegende Bürgerdienste',
        citizen_services_desc: 'Verstehen Sie, wie wir unseren Bürgern dienen',
        compliance_intro_title: 'Compliance und Prozesse',
        compliance_intro_desc: 'Wichtige Regeln und Prozesse für kommunale Arbeit'
      },
      french_municipal: {
        municipal_intro_title: 'Bienvenue aux Fondements Municipaux',
        municipal_intro_desc: 'Apprenez les bases de l\'administration municipale française',
        org_structure_title: 'Organisation Municipale',
        org_structure_desc: 'Explorez l\'organisation des municipalités françaises',
        citizen_services_title: 'Services Citoyens de Base',
        citizen_services_desc: 'Comprenez comment nous servons nos citoyens',
        compliance_intro_title: 'Conformité et Processus',
        compliance_intro_desc: 'Règles et processus importants pour le travail municipal'
      },
      dutch_municipal: {
        municipal_intro_title: 'Welkom bij Gemeentelijke Grondslagen',
        municipal_intro_desc: 'Leer de basis van Nederlandse gemeentelijke administratie',
        org_structure_title: 'Gemeentelijke Organisatie',
        org_structure_desc: 'Verken de organisatie van Nederlandse gemeenten',
        citizen_services_title: 'Basis Burgerdiensten',
        citizen_services_desc: 'Begrijp hoe wij onze burgers dienen',
        compliance_intro_title: 'Compliance en Processen',
        compliance_intro_desc: 'Belangrijke regels en processen voor gemeentelijk werk'
      }
    };
    return texts[culturalContext]?.[key as keyof typeof texts['swedish_municipal']] || key;
  }

  useEffect(() => {
    initializeWorld();
  }, []);

  const initializeWorld = async () => {
    try {
      setLoading(true);
      
      // Start world session through multi-world state manager
      const worldSession = await multiWorldStateManager.startWorldSession(
        hubSessionId,
        1, // World 1: Municipal Foundations
        'municipal-foundations-game'
      );

      if (!worldSession) {
        throw new Error('Failed to start Municipal Foundations world session');
      }

      setWorldState(worldSession.gameState);
      setLoading(false);
      
      console.log('🏛️ Municipal Foundations World initialized');
    } catch (error) {
      console.error('Failed to initialize Municipal Foundations World:', error);
      setLoading(false);
    }
  };

  const handleScenarioCompletion = async (scenarioResults: any) => {
    try {
      const scenario = scenarios[currentScenario];
      
      // Update game state with scenario completion
      await gameStateManager.updateGameState(worldState.sessionId, {
        currentSceneId: scenario.id,
        sceneIndex: currentScenario,
        sceneResult: scenarioResults,
        timeSpent: Date.now() - startTime
      });

      // Check if this is the last scenario
      if (currentScenario >= scenarios.length - 1) {
        // Complete the world
        await completeWorld(scenarioResults);
      } else {
        // Move to next scenario
        setCurrentScenario(currentScenario + 1);
      }
    } catch (error) {
      console.error('Error handling scenario completion:', error);
    }
  };

  const completeWorld = async (finalResults: any) => {
    try {
      // Complete the game session
      const gameResults = await gameStateManager.completeGameSession(worldState.sessionId);
      
      if (gameResults) {
        // Update multi-world state
        await multiWorldStateManager.completeWorld(hubSessionId, 1, gameResults);
        
        // Navigate back to hub with completion notification
        navigate(`/hub/${uniqueCode}`, {
          state: {
            worldCompleted: 1,
            results: gameResults,
            message: 'Grattis! Du har slutfört Kommunala Grunder.'
          }
        });
      }
    } catch (error) {
      console.error('Error completing Municipal Foundations World:', error);
    }
  };

  const handleReturnToHub = () => {
    navigate(`/hub/${uniqueCode}`);
  };

  if (loading) {
    return (
      <div className="municipal-foundations-loading">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="loading-content"
        >
          <div className="world-icon">🏛️</div>
          <h2>Laddar Kommunala Grunder...</h2>
          <p>Förbereder din introduktion till kommunal administration</p>
        </motion.div>
      </div>
    );
  }

  const currentScenarioData = scenarios[currentScenario];

  return (
    <div className="municipal-foundations-world" data-cultural-context={culturalContext}>
      {/* World Header */}
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="world-header"
      >
        <div className="world-branding">
          <div className="world-icon">🏛️</div>
          <div className="world-info">
            <h1 className="world-title">Kommunala Grunder</h1>
            <p className="world-subtitle">Värld 1 av 5 • Grundläggande kompetenser</p>
          </div>
        </div>
        
        <div className="world-progress">
          <div className="scenario-progress">
            <span className="progress-text">
              Scenario {currentScenario + 1} av {scenarios.length}
            </span>
            <div className="progress-bar">
              <div 
                className="progress-fill"
                style={{ width: `${((currentScenario + 1) / scenarios.length) * 100}%` }}
              />
            </div>
          </div>
          
          <button onClick={handleReturnToHub} className="return-to-hub-button">
            ← Tillbaka till Hub
          </button>
        </div>
      </motion.header>

      {/* Main Content */}
      <main className="world-content">
        <motion.div
          key={currentScenario}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className="scenario-container"
        >
          {/* Scenario Introduction */}
          <div className="scenario-intro">
            <h2 className="scenario-title">{currentScenarioData.title}</h2>
            <p className="scenario-description">{currentScenarioData.description}</p>
            
            <div className="scenario-metadata">
              <div className="scenario-meta-item">
                <span className="meta-label">Typ:</span>
                <span className="meta-value">{currentScenarioData.type}</span>
              </div>
              <div className="scenario-meta-item">
                <span className="meta-label">Tid:</span>
                <span className="meta-value">{currentScenarioData.estimatedTime} min</span>
              </div>
              <div className="scenario-meta-item">
                <span className="meta-label">Fokus:</span>
                <span className="meta-value">
                  {currentScenarioData.competencyFocus.join(', ')}
                </span>
              </div>
            </div>
          </div>

          {/* Scenario Content */}
          <div className="scenario-content">
            <DialogueScene
              gameId="municipal-foundations-game"
              sceneId={currentScenarioData.id}
              culturalContext={culturalContext}
              onSceneComplete={handleScenarioCompletion}
              mechanics={currentScenarioData.mechanics}
              competencyFocus={currentScenarioData.competencyFocus}
            />
          </div>
        </motion.div>
      </main>

      {/* World Footer */}
      <footer className="world-footer">
        <div className="competency-indicators">
          {currentScenarioData.competencyFocus.map((competency, index) => (
            <div key={competency} className="competency-indicator">
              <span className="competency-icon">📊</span>
              <span className="competency-name">{competency}</span>
            </div>
          ))}
        </div>
      </footer>
    </div>
  );
};