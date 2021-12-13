import { useAuth } from "../contexts/AuthContext";
import { setupAPIClient } from "../services/apiClient";
import { withSSRAuth } from "../shared/commons/withSSRAuth";


export default function Dashboard() {
  const { user } = useAuth();

  return (
    <h1>Dashboard: {user?.email}</h1>
  )
}

export const getServerSideProps = withSSRAuth(async (context) => {
  const apiClient = setupAPIClient(context);

  return {
    props: {}
  }
});