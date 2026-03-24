"use client";
import { useEffect } from 'react';
import axios from 'axios';
import { instance } from '@/components/fetch';

const useInteractionTracking = () => {
    useEffect(() => {
        const trackInteraction = (event) => {
            const { type, target } = event;
            const interactionData = {
                interaction_type: type,
                target: target.tagName,
                id: target.id || null,
                className: target.className || null,
                timestamp: new Date().toISOString(),
            };

            // Envoyer l'interaction au backend
            instance.post('/interactions/', interactionData)
                .catch((error) => {
                    console.error('Erreur de tracking:', error);
                });
        };

        // Écoute des clics et soumissions de formulaire
        document.addEventListener('click', trackInteraction);
        document.addEventListener('submit', trackInteraction);

        return () => {
            document.removeEventListener('click', trackInteraction);
            document.removeEventListener('submit', trackInteraction);
        };
    }, []);
};

export default useInteractionTracking;
