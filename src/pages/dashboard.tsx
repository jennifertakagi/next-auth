import { useAuth } from '../contexts/AuthContext';
import { setupAPIClient } from '../services/apiClient';
import { withSSRAuth } from '../shared/commons/withSSRAuth';
import { Can } from '../shared/components/Can';


export default function Dashboard() {
  const { user, signOut } = useAuth();

  return (
    <>
      <h1>Dashboard: {user?.email}</h1>
      
      <button onClick={signOut}>Sign Out</button>

      <Can permissions={['metrics.list']}>
        <div>Metrics</div>
      </Can>
    </>
  )
}

export const getServerSideProps = withSSRAuth(async (context) => {
  const apiClient = setupAPIClient(context);
  const response = await apiClient.get('/me');

  return {
    props: {
      response
    }
  }
});