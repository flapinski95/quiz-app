'use client';
import { useRouter } from 'next/navigation';
import styles from '../app/page.module.css';
import { useKeycloakContext } from '@/context/KeycloakContext';

export default function Header() {
  const router = useRouter();
  const { keycloak, authenticated } = useKeycloakContext();

  const isAdmin = keycloak?.tokenParsed?.realm_access?.roles?.includes('admin');

  return (
    <header className={styles.header}>
      <div className={styles.logo} onClick={() => router.push('/home')}>
        quiz-app
      </div>
      <nav className={styles.nav}>
        <button onClick={() => router.push('/profile')}>Profil</button>
        <button onClick={() => router.push('/create-quiz')}>Create quiz</button>
        {isAdmin && <button onClick={() => router.push('/admin')}>Admin</button>}
      </nav>
    </header>
  );
}
