// Frontend conference data for Rosa Custom backend
// Simplified version that matches the backend conference_data.py structure

export const conference_data = {
  speakers: [
    {
      id: "dr-sarah-chen",
      name: "Dr. Sarah Chen",
      title: "Lead Nuclear Verification Scientist",
      organization: "CTBTO Preparatory Commission",
      session: "Advanced Seismic Analysis for Nuclear Test Detection",
      time: "09:30 - 10:15",
      room: "Main Auditorium",
      expertise: [
        "Seismic monitoring and analysis",
        "Nuclear verification technologies",
        "Signal processing and pattern recognition",
        "Automated detection algorithms"
      ],
      biography: "Dr. Sarah Chen is a leading expert in seismic analysis with over 15 years of experience at the CTBTO Preparatory Commission. She has pioneered automated detection algorithms that reduced false positives by 85%, significantly enhancing the accuracy of nuclear test detection systems. Her groundbreaking work in seismic signal processing has been instrumental in developing the current generation of monitoring technologies used by the International Monitoring System.",
      relevance: "Keynote speaker presenting latest advances in AI-enhanced seismic monitoring.",
      type: "keynote"
    },
    {
      id: "prof-mikhail-volkov",
      name: "Prof. Mikhail Volkov",
      title: "Director of Radionuclide Technology",
      organization: "CTBTO Preparatory Commission",
      session: "Next-Generation Radionuclide Detection Systems",
      time: "11:00 - 11:45",
      room: "Conference Room A",
      expertise: [
        "Radionuclide detection and analysis",
        "Atmospheric monitoring systems",
        "Noble gas detection technologies",
        "Nuclear forensics and source identification"
      ],
      biography: "Professor Mikhail Volkov is a renowned physicist specializing in atmospheric radionuclide detection with over 20 years of experience in nuclear monitoring. As Director of Radionuclide Technology at the CTBTO, he has led the development of the current generation of noble gas detection systems deployed worldwide.",
      relevance: "Technology expert presenting breakthrough advances in radionuclide detection.",
      type: "technical"
    },
    {
      id: "dr-amira-hassan",
      name: "Dr. Amira Hassan",
      title: "Hydroacoustic Monitoring Specialist",
      organization: "CTBTO Preparatory Commission",
      session: "Hydroacoustic Monitoring Technologies",
      time: "14:30 - 15:15",
      room: "Workshop Hall",
      expertise: [
        "Hydroacoustic monitoring",
        "Ocean monitoring systems",
        "Underwater detection technologies",
        "Marine nuclear event detection"
      ],
      biography: "Dr. Amira Hassan specializes in underwater nuclear detection systems and has developed revolutionary hydroacoustic monitoring techniques for ocean-based nuclear activity detection.",
      relevance: "Leading expert in oceanic monitoring systems for nuclear test detection.",
      type: "technical"
    }
  ],
  
  sessions: [
    {
      id: "session-001",
      title: "Advanced Seismic Analysis for Nuclear Test Detection",
      speaker: "Dr. Sarah Chen",
      speaker_id: "dr-sarah-chen",
      time: "09:30 - 10:15",
      date: "2025-01-15",
      room: "Main Auditorium",
      type: "keynote",
      topics: ["seismic monitoring", "nuclear verification", "detection algorithms"],
      description: "Latest advances in AI-enhanced seismic monitoring and automated detection algorithms for nuclear test verification.",
      capacity: 500,
      registration_required: true
    },
    {
      id: "session-002",
      title: "Next-Generation Radionuclide Detection Systems",
      speaker: "Prof. Mikhail Volkov",
      speaker_id: "prof-mikhail-volkov",
      time: "11:00 - 11:45",
      date: "2025-01-15",
      room: "Conference Room A",
      type: "technical",
      topics: ["radionuclide detection", "atmospheric monitoring", "noble gases"],
      description: "Breakthrough advances in particulate and noble gas detection technologies for atmospheric monitoring.",
      capacity: 150,
      registration_required: true
    },
    {
      id: "session-003",
      title: "Hydroacoustic Monitoring Technologies",
      speaker: "Dr. Amira Hassan",
      speaker_id: "dr-amira-hassan",
      time: "14:30 - 15:15",
      date: "2025-01-15",
      room: "Workshop Hall",
      type: "technical",
      topics: ["hydroacoustic monitoring", "ocean monitoring", "underwater detection"],
      description: "Revolutionary underwater detection systems for monitoring nuclear activities in marine environments.",
      capacity: 100,
      registration_required: true
    }
  ]
}; 