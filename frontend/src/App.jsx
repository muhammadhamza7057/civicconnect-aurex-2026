import React from 'react'
import { Routes, Route } from 'react-router-dom'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<div className="p-8">Welcome to CivicConnect — Dashboard coming soon</div>} />
    </Routes>
  )
}
