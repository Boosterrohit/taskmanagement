import { Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { appUrls } from "../url"
import LandingPage from "../views/landingPage"
import TaskManagement from "../views/taskmanagement"

const Privateroutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <Routes>
            <Route path={appUrls.landingPage} element={<LandingPage/>}/>
            <Route path={appUrls.myTask} element={<TaskManagement/>}/>
        </Routes>
    </Suspense>
  )
}

export default Privateroutes