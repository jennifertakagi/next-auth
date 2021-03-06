import { FormEvent, useState } from 'react';
import styles from '../styles/Home.module.css';
import { useAuth } from '../contexts/AuthContext';
import { GetServerSideProps } from 'next';
import { withSSRGuest } from '../shared/commons/withSSRGuest';
import { redirect } from 'next/dist/server/api-utils';

export default function Home() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();

    const data = {
      email,
      password,
    }

    await signIn(data);
  }

  return (
    <form onSubmit={handleSubmit} className={styles.container}>
      <input type='email' value={email} onChange={e => setEmail(e.target.value)} />
      <input type='password' value={password} onChange={e => setPassword(e.target.value)} />
      <button type='submit'>Login</button>

    </form>
  )
}

export const getServerSideProps = withSSRGuest(async (context) => {
  return {
    props: {}
  }
})