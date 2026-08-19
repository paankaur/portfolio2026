import { SiGithub } from "@icons-pack/react-simple-icons";
import ProjectsCard from "@/components/ProjectsCard";

type Props = {
    title: string,
    name: string,
    phone?: string,
    email?: string,
    description?: string,
    image?: string,
    link?: string,
    linkText?: string,
    githubLink?: string
}

const BusinessCard = (props: Props) => {
  return (
    <div className="business-card bg-orange-100 shadow-xl rounded-2xl p-6 w-full h-full flex flex-col justify-center gap-2 border border-orange-200">
      <h3 className="text-xl text-center text-gray-700 font-bold mb-2">{props.title}</h3>
      <p className="text-gray-700 text-center font-semibold mb-2">{props.name}</p>
      {props.phone && <p className="text-gray-600 text-center font-semibold mb-2">{props.phone}</p>}
      {props.email && <p className="text-gray-600 text-center font-semibold mb-2">{props.email}</p>}
      {props.description && <p className="text-gray-600 font-semibold mb-2">{props.description}</p>}
      {props.image && <img src={props.image} alt={props.title} />}
      {props.link && <a target="_blank" rel="noopener noreferrer" href={props.link} className="text-blue-500 hover:underline text-center">{props.linkText || props.link}</a>}
      {props.githubLink && (
        <a target="_blank" rel="noopener noreferrer" href={props.githubLink} className="text-gray-700 hover:text-gray-900 flex items-center justify-center gap-1 mt-2">
          <SiGithub size={20} />
          <span>GitHub</span>
        </a>
      )}
      <ProjectsCard />
    </div>
  )
}

export default BusinessCard