import { Navigate, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { CareerTab } from './tabs/CareerTab'
import { CodingTab } from './tabs/CodingTab'
import { HomeTab } from './tabs/HomeTab'
import { StoryTab } from './tabs/StoryTab'
import { SystemDesignTab } from './tabs/SystemDesignTab'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomeTab />} />
        <Route path="story" element={<StoryTab />} />
        <Route path="coding" element={<CodingTab />} />
        <Route path="system-design" element={<SystemDesignTab />} />
        <Route path="career" element={<CareerTab />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  )
}
