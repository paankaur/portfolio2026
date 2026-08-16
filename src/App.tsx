
import BusinessCard from './components/BusinessCard'
import GameBoard from './components/GameBoard'


function App() {


  return (
    <>
        <GameBoard>
        <BusinessCard 
          title="Hello!"
          name="I am Paan Kaur Riives"
          phone="+372 5625 8379"
          email="paan.kaur@gmail.com"
          description={`Looking to begin my first job in the IT field. I am a fast learner and a hard worker. I am looking for a position where I can grow and learn new skills. Here will appear my future projects!`}
          link="CV-Paan-Kaur-Riives.pdf"
          linkText="Open my CV"
          githubLink="https://github.com/paankaur"
/>
      </GameBoard>
    </>
  )
}

export default App
