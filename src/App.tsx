
import './App.css';
import { Link, RouterProvider } from 'react-router-dom';
import { router } from './route';
import ConnectDivsWithLine from './line';

function App() {
  return (
    <div className="App"style={{height:"100vh"}}>
     
       <RouterProvider router={router} />
       {/* <ConnectDivsWithLine/> */}
    </div>
  );
}

export default App;
