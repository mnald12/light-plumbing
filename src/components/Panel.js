import '../css/Panel.css'
import { Data } from '../App'
import { useContext } from 'react'

const Panel = () => {
   const { connection, removeConnection } = useContext(Data)
   return (
      <div className="panel" id="panel">
         <div className="delete-menu" id="delete-menu">
            <button
               onClick={() => {
                  removeConnection(connection)
               }}
            >
               Delete this connection
            </button>
         </div>
      </div>
   )
}

export default Panel
