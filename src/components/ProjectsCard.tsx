
import { Link } from "react-router"

type Props = {

}

export default function ProjectsCard(props: Props) {
  return (
    <div>
        <Link to="/cube-sim" className="text-blue-500 hover:underline text-center">Cube Algorithm Simulator</Link>
    </div>
  )
}
