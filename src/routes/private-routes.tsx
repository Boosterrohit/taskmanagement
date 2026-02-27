import { Suspense } from "react"
import { Route, Routes } from "react-router-dom"
import { appUrls } from "../url"
import LandingPage from "../views/landingPage"
import AllTasks from "@/views/taskmanagement/allTasks"
import Layout from "@/components/taskContext/Layout"
import MyTask from "@/views/taskmanagement/myTask"
import Calendar from "@/views/taskmanagement/calendar"

const Privateroutes = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
        <Routes>
            <Route path={appUrls.landingPage} element={<LandingPage/>}/>
            <Route path={appUrls.myTask} element={
              <Layout>
                <MyTask/>
              </Layout>
            }/>
            <Route
              path={appUrls.allTasks}
              element={
                <Layout>
                  <AllTasks/>
                </Layout>
              }
            />
            <Route path={appUrls.calendar} element={
              <Layout>
                <Calendar/>
              </Layout>
            }/>
        </Routes>
    </Suspense>
  )
}

export default Privateroutes