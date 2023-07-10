import './css/App.css'
import Controller from './components/Controller'
import Panel from './components/Panel'
import jsPlumb from 'jsplumb'

import { createContext, useEffect, useState } from 'react'
import { v4 } from 'uuid'

const Data = createContext(null)

function App() {
   const [elements, setElements] = useState([])
   const j = jsPlumb.jsPlumb

   useEffect(() => {
      document.getElementById('panel').addEventListener('click', () => {
         const menu = document.getElementById('delete-menu')
         menu.style.display = 'none'
      })
   }, [])

   const [connection, setConnection] = useState(null)

   useEffect(() => {
      j.bind('contextmenu', (component, event) => {
         if (component.hasClass('jtk-connector')) {
            event.preventDefault()
            setConnection(component)
            const menu = document.getElementById('delete-menu')
            menu.style.left = event.x + 'px'
            menu.style.top = event.y + 'px'
            menu.style.display = 'block'
         }
      })

      j.bind('connection', (con) => {
         if (
            con.source.classList.contains('power-supply') &&
            con.target.classList.contains('light-bulb')
         ) {
            con.target.style.background = 'yellow'
         }

         if (
            con.source.classList.contains('switch') &&
            con.target.classList.contains('light-bulb')
         ) {
            if (
               con.source.classList.contains('on') &&
               con.source.classList.contains('energized')
            ) {
               con.target.style.background = 'yellow'
            }

            con.source.classList.add('connected')
            con.source.setAttribute('connected', con.targetId)
         }

         if (
            con.source.classList.contains('power-supply') &&
            con.target.classList.contains('switch')
         ) {
            con.target.classList.add('energized')
            if (con.target.classList.contains('on')) {
               if (con.target.hasAttribute('connected')) {
                  const bulb = con.target.getAttribute('connected')
                  document.getElementById(bulb).style.background = 'yellow'
               }
            }
         }
      })

      j.bind('connectionDetached', (con) => {
         if (con.target.classList.contains('light-bulb')) {
            if (con.source.classList.contains('switch')) {
               con.source.classList.remove('connected')
            }
            con.target.style.background = 'white'
         }
         if (con.target.classList.contains('switch')) {
            if (con.target.hasAttribute('connected')) {
               const bulb = con.target.getAttribute('connected')
               document.getElementById(bulb).style.background = 'white'
               con.target.classList.remove('energized')
            }
         }
      })

      j.bind('connectionMoved', (con) => {
         const el = document.getElementById(con.originalTargetId)
         if (el.classList.contains('light-bulb')) {
            el.style.background = 'white'
         }
      })

      j.bind('mouseover', (component, event) => {
         if (component.connections) {
            if (component.connections.length === 5) {
               alert('Power Supply is Full')
            }
         }
      })
   }, [j])

   const removeElement = (name, id, ep, ep2) => {
      if (name === 'Switch') {
         j.deleteEndpoint(ep)
         j.deleteEndpoint(ep2)
         document.getElementById(id).remove()
         setElements(elements.filter((elem) => elem.id !== id))
      } else {
         j.deleteEndpoint(ep)
         document.getElementById(id).remove()
         setElements(elements.filter((elem) => elem.id !== id))
      }
   }
   const removeConnection = (con) => {
      j.deleteConnection(con)
      const menu = document.getElementById('delete-menu')
      menu.style.display = 'none'
   }
   const removeAllConnection = () => {
      j.deleteEveryConnection()
   }

   const onHov = (id) => {
      document.getElementById(id).classList.add('on-hover')
   }

   const unHov = (id) => {
      document.getElementById(id).classList.remove('on-hover')
   }

   const addPowerSupply = () => {
      const ID = v4()
      var props = {
         isSource: true,
         endpoint: 'Dot',
         connector: 'Flowchart',
         maxConnections: 5,
         paintStyle: { fill: '#3e3e3e' },
         connectorStyle: { outlineStroke: '#3e3e3e', strokeWidth: 0.5 },
         connectorHoverStyle: { strokeWidth: 3 },
      }

      const panel = document.getElementById('panel')

      const newElement = document.createElement('div')
      newElement.id = ID
      newElement.innerHTML = `
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-battery-full"
            viewBox="0 0 16 16"
         >
            <path d="M2 6h10v4H2V6z" />
            <path d="M2 4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H2zm10 1a1 1 0 0 1 1 1v4a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h10zm4 3a1.5 1.5 0 0 1-1.5 1.5v-3A1.5 1.5 0 0 1 16 8z" />
         </svg>
      `
      newElement.classList.add('element')
      newElement.classList.add('power-supply')
      newElement.style.position = 'absolute'
      newElement.style.left = '20px'
      newElement.style.top = '20px'

      panel.appendChild(newElement)

      j.draggable(ID, { containment: true })

      const ep = j.addEndpoint(
         ID,
         {
            anchor: [
               'TopLeft',
               'TopRight',
               'BottomLeft',
               'BottomRight',
               'LeftMiddle',
               'RightMiddle',
               'TopCenter',
               'BottomCenter',
            ],
         },
         props
      )

      const supply = {
         name: 'Power Supply',
         id: ID,
         endPoint: ep,
      }

      setElements([...elements, supply])
   }

   const addLightBulb = () => {
      const data = {
         status: 'off',
      }

      const ID = v4()
      var props = {
         isTarget: true,
         endpoint: 'Dot',
         maxConnections: 1,
         paintStyle: { fill: '#3e3e3e' },
         connectorStyle: { outlineStroke: '#3e3e3e', strokeWidth: 0.5 },
         connectorHoverStyle: { strokeWidth: 3 },
      }

      const panel = document.getElementById('panel')

      const newElement = document.createElement('div')
      newElement.id = ID
      newElement.innerHTML = `
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-lightbulb"
            viewBox="0 0 16 16"
         >
            <path d="M2 6a6 6 0 1 1 10.174 4.31c-.203.196-.359.4-.453.619l-.762 1.769A.5.5 0 0 1 10.5 13a.5.5 0 0 1 0 1 .5.5 0 0 1 0 1l-.224.447a1 1 0 0 1-.894.553H6.618a1 1 0 0 1-.894-.553L5.5 15a.5.5 0 0 1 0-1 .5.5 0 0 1 0-1 .5.5 0 0 1-.46-.302l-.761-1.77a1.964 1.964 0 0 0-.453-.618A5.984 5.984 0 0 1 2 6zm6-5a5 5 0 0 0-3.479 8.592c.263.254.514.564.676.941L5.83 12h4.342l.632-1.467c.162-.377.413-.687.676-.941A5 5 0 0 0 8 1z" />
         </svg>
      `

      newElement.classList.add('element')
      newElement.classList.add('light-bulb')
      newElement.style.position = 'absolute'
      newElement.style.left = '20px'
      newElement.style.top = '20px'

      newElement.setAttribute('status', 'off')

      panel.appendChild(newElement)

      j.draggable(ID, { containment: true })

      const ep = j.addEndpoint(
         ID,
         {
            anchor: [
               'TopLeft',
               'TopRight',
               'BottomLeft',
               'BottomRight',
               'LeftMiddle',
               'RightMiddle',
               'TopCenter',
               'BottomCenter',
            ],
         },
         props
      )

      const light = {
         name: 'Light Bulb',
         id: ID,
         endPoint: ep,
         data: data,
      }

      setElements([...elements, light])
   }

   const addSwitch = () => {
      const ID = v4()

      const data = {
         parentId: ID,
         b1: null,
         b2: null,
      }

      var props = {
         isTarget: true,
         endpoint: 'Dot',
         maxConnections: 1,
         paintStyle: { fill: '#3e3e3e' },
         connectorStyle: { outlineStroke: '#3e3e3e', strokeWidth: 0.5 },
         connectorHoverStyle: { strokeWidth: 3 },
      }

      var props2 = {
         isSource: true,
         endpoint: 'Dot',
         maxConnections: 1,
         connector: 'Flowchart',
         paintStyle: { fill: '#3e3e3e' },
         connectorStyle: { outlineStroke: '#3e3e3e', strokeWidth: 0.5 },
         connectorHoverStyle: { strokeWidth: 3 },
      }

      const panel = document.getElementById('panel')

      const newElement = document.createElement('div')
      newElement.id = ID
      newElement.classList.add('element')
      newElement.classList.add('switch')
      newElement.classList.add('off')

      newElement.style.position = 'absolute'
      newElement.style.left = '20px'
      newElement.style.top = '20px'

      const btn1 = document.createElement('button')
      btn1.classList.add('switch-off')
      btn1.innerHTML = `
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30"
            height="30"
            fill="currentColor"
            className="bi bi-toggle-off"
            viewBox="0 0 16 16"
         >
            <path d="M11 4a4 4 0 0 1 0 8H8a4.992 4.992 0 0 0 2-4 4.992 4.992 0 0 0-2-4h3zm-6 8a4 4 0 1 1 0-8 4 4 0 0 1 0 8zM0 8a5 5 0 0 0 5 5h6a5 5 0 0 0 0-10H5a5 5 0 0 0-5 5z" />
         </svg>
      `
      btn1.addEventListener('click', () => {
         const parent = document.getElementById(data.parentId)
         if (
            parent.classList.contains('energized') &&
            parent.classList.contains('connected')
         ) {
            if (parent.hasAttribute('connected')) {
               const bulb = parent.getAttribute('connected')
               document.getElementById(bulb).style.background = 'yellow'
            }
         }
         data.b2.style.display = 'block'
         data.b1.style.display = 'none'
         parent.classList.add('on')
         parent.classList.remove('off')
      })

      const btn2 = document.createElement('button')
      btn2.classList.add('switch-on')
      btn2.innerHTML = `
         <svg
            xmlns="http://www.w3.org/2000/svg"
            width="30" height="30" fill="currentColor"
            className="bi bi-toggle-on" 
            viewBox="0 0 16 16"
         >
            <path d="M5 3a5 5 0 0 0 0 10h6a5 5 0 0 0 0-10H5zm6 9a4 4 0 1 1 0-8 4 4 0 0 1 0 8z"/>
         </svg>
      `
      btn2.addEventListener('click', () => {
         const parent = document.getElementById(data.parentId)
         if (parent.hasAttribute('connected')) {
            const bulb = parent.getAttribute('connected')
            document.getElementById(bulb).style.background = 'white'
         }
         data.b1.style.display = 'block'
         data.b2.style.display = 'none'
         parent.classList.add('off')
         parent.classList.remove('on')
      })
      newElement.appendChild(btn2)
      newElement.appendChild(btn1)

      data.b1 = btn1
      data.b2 = btn2

      panel.appendChild(newElement)

      j.draggable(ID, { containment: true })

      const ep = j.addEndpoint(
         ID,
         {
            anchor: ['LeftMiddle'],
         },
         props
      )

      const ep2 = j.addEndpoint(
         ID,
         {
            anchor: ['RightMiddle'],
         },
         props2
      )

      const switchs = {
         name: 'Switch',
         id: ID,
         endPoint: ep,
         endPoint2: ep2,
      }

      setElements([...elements, switchs])
   }

   return (
      <Data.Provider
         value={{
            elements,
            addPowerSupply,
            addLightBulb,
            addSwitch,
            removeElement,
            removeConnection,
            removeAllConnection,
            onHov,
            unHov,
            connection,
         }}
      >
         <div className="container">
            <Panel />
            <Controller />
         </div>
      </Data.Provider>
   )
}

export default App
export { Data }
