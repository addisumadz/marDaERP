import React, { useState, useEffect } from 'react';
import { BackHandler, Alert } from 'react-native';
import { authService } from './src/services/authService';
import { offlineQueueService } from './src/services/offlineQueueService';
import { newLineAPI } from './src/api/endpoints';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import SurveyListScreen from './src/screens/SurveyListScreen';
import SurveyDetailScreen from './src/screens/SurveyDetailScreen';
import InstallationListScreen from './src/screens/InstallationListScreen';
import InstallationDetailScreen from './src/screens/InstallationDetailScreen';

/**
 * MarDa Field App
 * Mobile application for plumbers/technicians to manage
 * survey and installation jobs in the field.
 *
 * Screens:
 *  - login
 *  - home (dashboard)
 *  - surveyList → surveyDetail
 *  - installationList → installationDetail
 */
export default function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isCheckingAuth, setIsCheckingAuth] = useState(true);
    const [currentScreen, setCurrentScreen] = useState('home');
    const [selectedJob, setSelectedJob] = useState(null);

    // Check saved auth on startup
    useEffect(() => {
        authService.isAuthenticated().then((isAuth) => {
            setIsAuthenticated(isAuth);
            setIsCheckingAuth(false);
        });
    }, []);

    // Auto-sync offline queue when app opens (if authenticated)
    useEffect(() => {
        if (isAuthenticated) {
            syncOfflineQueue();
        }
    }, [isAuthenticated]);

    // Hardware back button handling
    useEffect(() => {
        const backAction = () => {
            if (!isAuthenticated) return false;

            if (currentScreen === 'home') {
                BackHandler.exitApp();
                return true;
            }

            if (currentScreen === 'surveyDetail' || currentScreen === 'installationDetail') {
                setSelectedJob(null);
                setCurrentScreen(currentScreen === 'surveyDetail' ? 'surveyList' : 'installationList');
                return true;
            }

            if (currentScreen === 'surveyList' || currentScreen === 'installationList') {
                setCurrentScreen('home');
                return true;
            }

            return false;
        };

        const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
        return () => handler.remove();
    }, [isAuthenticated, currentScreen]);

    /**
     * Process any offline-queued actions when we're back online
     */
    const syncOfflineQueue = async () => {
        try {
            const result = await offlineQueueService.processQueue(async (entry) => {
                if (entry.type === 'SUBMIT_SURVEY') {
                    await newLineAPI.submitSurvey(entry.applicationId, entry.data);
                } else if (entry.type === 'COMPLETE_INSTALLATION') {
                    await newLineAPI.completeInstallation(entry.applicationId, entry.data);
                }
            });

            if (result.synced > 0) {
                Alert.alert(
                    'ሲንክ ተሳክቷል ✓',
                    `${result.synced} ከመስመር ውጪ ያልተላኩ ሥራዎች ተልከዋል${result.failed > 0 ? ` (${result.failed} ያልተሳኩ)` : ''}`
                );
            }
        } catch (error) {
            console.warn('[App] Offline sync error:', error);
        }
    };

    // Login/Logout handlers
    const handleLoginSuccess = () => {
        setIsAuthenticated(true);
        setCurrentScreen('home');
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setCurrentScreen('home');
        setSelectedJob(null);
    };

    // Navigation handler
    const handleNavigate = (screen) => {
        setCurrentScreen(screen);
    };

    // Loading state
    if (isCheckingAuth) {
        return null;
    }

    // Not authenticated → show login
    if (!isAuthenticated) {
        return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
    }

    // Screen router
    switch (currentScreen) {
        case 'surveyList':
            return (
                <SurveyListScreen
                    onSelectJob={(job) => {
                        setSelectedJob(job);
                        setCurrentScreen('surveyDetail');
                    }}
                    onBack={() => setCurrentScreen('home')}
                />
            );

        case 'surveyDetail':
            return (
                <SurveyDetailScreen
                    application={selectedJob}
                    onBack={() => {
                        setSelectedJob(null);
                        setCurrentScreen('surveyList');
                    }}
                    onSuccess={syncOfflineQueue}
                />
            );

        case 'installationList':
            return (
                <InstallationListScreen
                    onSelectJob={(job) => {
                        setSelectedJob(job);
                        setCurrentScreen('installationDetail');
                    }}
                    onBack={() => setCurrentScreen('home')}
                />
            );

        case 'installationDetail':
            return (
                <InstallationDetailScreen
                    application={selectedJob}
                    onBack={() => {
                        setSelectedJob(null);
                        setCurrentScreen('installationList');
                    }}
                    onSuccess={syncOfflineQueue}
                />
            );

        case 'home':
        default:
            return (
                <HomeScreen
                    onNavigate={handleNavigate}
                    onLogout={handleLogout}
                />
            );
    }
}
