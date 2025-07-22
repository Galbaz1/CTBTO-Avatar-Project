import React, { useEffect, useCallback, useState } from "react";
import {
	DailyAudio,
	DailyVideo,
	useDevices,
	useLocalSessionId,
	useMeetingState,
	useScreenVideoTrack,
	useVideoTrack
} from "@daily-co/daily-react";
import { MicSelectBtn, CameraSelectBtn, ScreenShareButton } from '../device-select'
import { useLocalScreenshare } from "../../hooks/use-local-screenshare";
import { useReplicaIDs } from "../../hooks/use-replica-ids";
import { useCVICall } from "../../hooks/use-cvi-call";
import { AudioWave } from "../audio-wave";
import { WebGLGreenScreenVideo } from "../webgl-green-screen-video";
import { GreenScreenDebugger } from "../../../debug/GreenScreenDebugger";

import styles from "./conversation.module.css";

interface ConversationProps {
	onLeave: () => void;
	conversationUrl: string;
}

const VideoPreview = React.memo(({ id }: { id: string }) => {
	const videoState = useVideoTrack(id);
	const widthVideo = videoState.track?.getSettings()?.width;
	const heightVideo = videoState.track?.getSettings()?.height;
	const isVertical = widthVideo && heightVideo ? widthVideo < heightVideo : false;

	return (
		<div
			className={`${styles.previewVideoContainer} ${isVertical ? styles.previewVideoContainerVertical : ''} ${videoState.isOff ? styles.previewVideoContainerHidden : ''}`}
		>
			<DailyVideo
				automirror
				sessionId={id}
				type="video"
				className={`${styles.previewVideo} ${isVertical ? styles.previewVideoVertical : ''} ${videoState.isOff ? styles.previewVideoHidden : ''}`}
			/>
			<div className={styles.audioWaveContainer}>
				<AudioWave id={id} />
			</div>
		</div>
	);
});

const PreviewVideos = React.memo(() => {
	const localId = useLocalSessionId();
	const { isScreenSharing } = useLocalScreenshare();
	const replicaIds = useReplicaIDs();
	const replicaId = replicaIds[0];

	return (
		<>
			{isScreenSharing && (
				<VideoPreview id={replicaId} />
			)}
			<VideoPreview id={localId} />
		</>
	);
});

const MainVideo = React.memo(() => {
	const replicaIds = useReplicaIDs();
	const localId = useLocalSessionId();
	const videoState = useVideoTrack(replicaIds[0]);
	const screenVideoState = useScreenVideoTrack(localId);
	const isScreenSharing = !screenVideoState.isOff;
	// This is one-to-one call, so we can use the first replica id
	const replicaId = replicaIds[0];
	
	// Green screen state
	const [greenScreenParams, setGreenScreenParams] = useState({
		keyColor: [0.0, 0.9, 0.2] as [number, number, number],
		similarity: 0.45,
		smoothness: 0.1,
		spill: 0.2,
		disableGreenScreen: false,
	});

	if (!replicaId) {
		return (
			<div className={styles.waitingContainer}>
				<p>Connecting...</p>
			</div>
		);
	}

	// Use green screen for Rosa's video (replica), regular video for screen sharing
	return (
		<div
			className={`${styles.mainVideoContainer} ${isScreenSharing ? styles.mainVideoContainerScreenSharing : ''}`}
		>
			{isScreenSharing ? (
				<DailyVideo
					automirror
					sessionId={localId}
					type="screenVideo"
					className={`${styles.mainVideo} ${styles.mainVideoScreenSharing}`}
				/>
			) : (
				<WebGLGreenScreenVideo
					sessionId={replicaId}
					className={`${styles.mainVideo} ${videoState.isOff ? styles.mainVideoHidden : ''}`}
					keyColor={greenScreenParams.keyColor}
					similarity={greenScreenParams.similarity}
					smoothness={greenScreenParams.smoothness}
					spill={greenScreenParams.spill}
					disableGreenScreen={greenScreenParams.disableGreenScreen}
					onVideoLoad={() => console.log('✅ Green screen video loaded')}
				/>
			)}
			
			{/* Green Screen Debug Controls */}
			{!isScreenSharing && (
				<GreenScreenDebugger
					onParametersChange={setGreenScreenParams}
					initialParams={greenScreenParams}
				/>
			)}
		</div>
	);
});

export const Conversation = React.memo(({ onLeave, conversationUrl }: ConversationProps) => {
	const { joinCall, leaveCall } = useCVICall();
	const meetingState = useMeetingState();
	const { hasMicError } = useDevices()

	useEffect(() => {
		if (meetingState === 'error') {
			onLeave();
		}
	}, [meetingState, onLeave]);

	// Initialize call when conversation is available
	useEffect(() => {
		joinCall({ url: conversationUrl });
	}, []);

	const handleLeave = useCallback(() => {
		leaveCall();
		onLeave();
	}, [leaveCall, onLeave]);

	return (
		<div className={styles.container}>
			<div className={styles.videoContainer}>
				{
					hasMicError && (
						<div className={styles.errorContainer}>
							<p>
								Camera or microphone access denied. Please check your settings and try again.
							</p>
						</div>
					)}

				{/* Main video */}
				<div className={styles.mainVideoContainer}>
					<MainVideo />
				</div>

				{/* Self view */}
				<div className={styles.selfViewContainer}>
					<PreviewVideos />
				</div>
			</div>

			<div className={styles.footer}>
				<div className={styles.footerControls}>
					<MicSelectBtn />
					<CameraSelectBtn />
					<ScreenShareButton />
					<button type="button" className={styles.leaveButton} onClick={handleLeave}>
						<span className={styles.leaveButtonIcon}>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width="24"
								height="24"
								viewBox="0 0 24 24"
								fill="none"
								role="img"
								aria-label="Leave Call"
							>
								<path
									d="M18 6L6 18M6 6L18 18"
									stroke="currentColor"
									strokeWidth="2"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					</button>
				</div>
			</div>

			<DailyAudio />
		</div>
	);
});
