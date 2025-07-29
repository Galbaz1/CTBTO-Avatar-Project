"use client";

export interface SpeakerSession {
  id: string;
  title: string;
  time: string;
}

export interface VoiceSpeakerCardProps {
  data: {
    id: string;
    name: string;
    affiliation?: string;
    bio?: string;
    sessions: SpeakerSession[];
  };
}

export function VoiceSpeakerCard({ data }: VoiceSpeakerCardProps) {
  return (
    <article
      role="article"
      aria-labelledby={`speaker-${data.id}-title`}
      aria-live="polite"
      className="p-6 bg-gray-900 text-white rounded-lg shadow-lg max-w-xl mx-auto"
    >
      <header>
        <h2
          id={`speaker-${data.id}-title`}
          className="text-2xl font-bold mb-2 text-white"
        >
          {data.name}
        </h2>
        {data.affiliation && <p aria-label="Affiliation">{data.affiliation}</p>}
      </header>
      {data.bio && (
        <p className="mt-2" aria-label="Biography">
          {data.bio}
        </p>
      )}
      {data.sessions?.length > 0 && (
        <section className="mt-4" aria-label="Sessions">
          <h3 className="font-semibold text-white">Sessions:</h3>
          <ul className="list-disc list-inside">
            {data.sessions.map((s) => (
              <li key={s.id}>
                {s.title} <time dateTime={s.time}>{s.time}</time>
              </li>
            ))}
          </ul>
        </section>
      )}
    </article>
  );
}
