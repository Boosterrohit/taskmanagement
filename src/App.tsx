import { BrowserRouter } from "react-router-dom"
import Privateroutes from "./routes/private-routes"

const App = () => {
  return (
    <BrowserRouter>
      <AppContent/>
    </BrowserRouter>
  )
}

const AppContent = () => {

  return (
    <>
    <Privateroutes/>
    </>
  )
}

export default App