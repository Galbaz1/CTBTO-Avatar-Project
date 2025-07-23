import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useSimpleStore } from './useSimpleStore';

export const SimpleInfoBulletin = () => {
  const { currentPanel, currentSpeaker, currentVenue, resetToWelcome } = useSimpleStore();

  const renderContent = () => {
    switch (currentPanel) {
      case 'speaker':
        return currentSpeaker ? (
          <Card>
            <CardHeader>
              <CardTitle>{currentSpeaker.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <p>{currentSpeaker.title}</p>
              <div className="mt-4 p-3 bg-blue-50 rounded">
                <p><strong>Session:</strong> {currentSpeaker.session.time}</p>
                <p><strong>Room:</strong> {currentSpeaker.session.room}</p>
              </div>
            </CardContent>
          </Card>
        ) : <div>No speaker data</div>;
      
      case 'venue':
        return currentVenue ? (
          <Card>
            <CardHeader>
              <CardTitle>{currentVenue.name}</CardTitle>
            </CardHeader>
            <CardContent>
              <img src={currentVenue.mapImage} alt="Venue map" className="w-full mb-4" />
              <div className="bg-green-50 p-3 rounded text-center">
                <p className="font-semibold">🚶‍♂️ {currentVenue.walkingTime} from kiosk</p>
              </div>
            </CardContent>
          </Card>
        ) : <div>No venue data</div>;
      
      default:
        return (
          <Card className="bg-blue-500 text-white">
            <CardHeader>
              <CardTitle>Welcome to CTBTO SnT 2025</CardTitle>
            </CardHeader>
            <CardContent>
              <p>Ask Rosa about speakers, venues, or the conference!</p>
            </CardContent>
          </Card>
        );
    }
  };

  return (
    <div className="h-full flex flex-col bg-white">
      <div className="p-4 border-b flex justify-between items-center">
        <h2 className="text-lg font-semibold">Conference Info</h2>
        {currentPanel !== 'welcome' && (
          <Button onClick={resetToWelcome} size="sm" variant="outline">
            ← Back
          </Button>
        )}
      </div>
      
      <div className="flex-1 p-4">
        {renderContent()}
      </div>
    </div>
  );
}; 