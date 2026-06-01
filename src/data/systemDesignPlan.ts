export const MOCK_STRUCTURE = [
  { minutes: 5, title: 'Requirements', body: 'Functional and non-functional requirements; clarify scale.' },
  { minutes: 5, title: 'High-level design', body: 'Boxes and arrows; agree on scope.' },
  { minutes: 25, title: 'Deep dive', body: 'Two components in depth — where vocabulary and follow-ups matter most.' },
  { minutes: 10, title: 'Tradeoffs and follow-ups', body: 'What you would change, what breaks, what you would do with more time.' },
] as const

export const STALL_CHECKLIST = [
  { title: 'Failure modes', prompt: 'What happens when this fails?' },
  { title: 'Scaling', prompt: 'How does this behave at 10× load?' },
  { title: 'Observability', prompt: 'How would I monitor this?' },
  { title: 'Performance', prompt: 'What is the latency of this operation?' },
  { title: 'Consistency', prompt: 'What is the consistency model here?' },
  { title: 'Tradeoffs', prompt: 'What is the cost or complexity of this choice?' },
] as const

export const STUDY_QUESTIONS = [
  'What does this component do?',
  'When would I choose this over alternatives?',
  'What breaks under high load?',
  'How do I make it fault tolerant?',
  'What does it cost me (latency, money, complexity)?',
] as const

export const PROBLEM_WORKFLOW = [
  'Spend ~20 minutes designing solo on paper or Excalidraw before reading any solution. Capture requirements, components, capacity estimates, and deep dives.',
  'Read the Xu chapter or Hello Interview walkthrough. List every gap between your attempt and the reference — those gaps are your study queue.',
  'Redo the parts you missed on paper or in the diagram; do not stop at “I get it now.”',
] as const

export const WEEKLY_RHYTHM = [
  { when: 'Monday', focus: 'One building block (or review a weak block), ~30–45 min.' },
  { when: 'Wednesday', focus: 'One problem: solo + review + gaps, ~90 min.' },
  { when: 'Friday', focus: 'Second problem or deeper redo, ~60 min.' },
  { when: 'Alt. Saturday', focus: 'Timed mock from week 4, 45 min.' },
] as const
