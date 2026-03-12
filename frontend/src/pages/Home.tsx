import { Link } from "react-router-dom"

const Home = () => {
  return (
    <div>
      <h1 className="text-3xl font-bold text-center mt-10">Wellcome to Home Page</h1>

      <div className="links flex justify-center gap-4 mt-10">
        <Link to="/login" className="text-blue-500 underline cursor-pointer hover:font-bold">Login</Link>
        <Link to="/artist" className="text-blue-500 underline cursor-pointer hover:font-bold">Artist</Link>
        <Link to="/users" className="text-blue-500 underline cursor-pointer hover:font-bold">Users</Link>
      </div>
    </div>
  )
}

export default Home