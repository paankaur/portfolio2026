
import { Link } from "react-router"
import { Box } from "lucide-react"



export default function ProjectsCard() {
  return (
    <div>
        <Link to="/cube-sim" className="text-blue-500 hover:text-blue-400 transition-colors" title="Cube Algorithm Simulator">
          <Box size={24} />
        </Link>
    </div>
  )
}
