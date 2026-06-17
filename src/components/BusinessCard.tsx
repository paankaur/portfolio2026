

type Props = {
    title: string,
    name: string,
    phone?: string,
    email?: string,
    description?: string,
    image?: string,
}

const BusinessCard = (props: Props) => {
  return (
    <div className="business-card bg-orange-100 shadow-md rounded-lg p-6 max-w-sm mx-auto gap-4">
      <h3 className="text-xl text-gray-700 font-bold mb-2">{props.title}</h3>
      <p className="text-gray-700 font-semibold mb-2">{props.name}</p>
      {props.phone && <p className="text-gray-600 font-semibold mb-2">{props.phone}</p>}
      {props.email && <p className="text-gray-600 font-semibold mb-2">{props.email}</p>}
      {props.description && <p className="text-gray-600 font-semibold mb-2">{props.description}</p>}
      {props.image && <img src={props.image} alt={props.title} />}
    </div>
  )
}

export default BusinessCard