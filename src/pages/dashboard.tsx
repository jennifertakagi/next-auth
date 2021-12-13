import { useAuth } from "../contexts/AuthContext";
import { useCan } from "../hooks/useCan";
import { setupAPIClient } from "../services/apiClient";
import { withSSRAuth } from "../shared/commons/withSSRAuth";


export default function Dashboard() {
  const { user } = useAuth();
  const userCanSeeMetrics = useCan({
    permissions: ['metrics.list']
  });

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      { userCanSeeMetrics && <div>Metrics</div> }
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (context) => {
  const apiClient = setupAPIClient(context);

  return {
    props: {}
  }
});