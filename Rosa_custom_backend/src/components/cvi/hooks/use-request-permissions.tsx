import { useCallback } from 'react';
import { useDaily } from '@daily-co/daily-react';
import type { DailyDeviceInfos } from '@daily-co/daily-js';

export const useRequestPermissions = (): (() => Promise<DailyDeviceInfos>) => {
	const daily = useDaily();

	const requestPermissions = useCallback(async () => {
		return await daily!.startCamera({
			startVideoOff: true, // No camera - video off
			startAudioOff: false, // Keep microphone
			audioSource: 'default',
			inputSettings: {
				audio: {
					processor: {
						type: 'noise-cancellation',
					},
				},
			},
		});
	}, [daily]);

	return requestPermissions;
};
