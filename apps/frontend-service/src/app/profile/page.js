'use client';

import { useEffect, useState } from 'react';
import { useKeycloakContext } from '@/context/KeycloakContext';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field } from 'formik';
import styles from '../page.module.css';
import api from '@/lib/axios';
import uploadAvatar from '@/utils/uploadAvatar'; 

export default function UserProfilePage() {
  const { keycloak, authenticated, loading } = useKeycloakContext();
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/');
    }
  }, [authenticated, loading]);

  // Pobierz dane użytkownika z backendu
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = keycloak.token;
        console.log("Token:", keycloak.token);
        console.log("Token decoded:", keycloak.tokenParsed);

        const response = await api.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setProfile(response.data);
      } catch (err) {
        console.error('Błąd pobierania profilu:', err);
      }
    };

    if (authenticated) {
      fetchProfile();
    }
  }, [authenticated]);

  // Aktualizacja awatara
  const handleAvatarUpdate = async (values, { setSubmitting }) => {
    try {
      const token = keycloak.token;

      const response = await api.post(
        '/api/users/me/avatar',
        { avatarUrl: values.avatarUrl },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Błąd aktualizacji awatara:', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || !authenticated || !profile) return <p>Ładowanie...</p>;

  const username = keycloak.tokenParsed?.preferred_username || 'Nieznany';

  return (
    <div className={styles.profileContainer}>
      <h2>Profil użytkownika</h2>
      <img
        src={profile.avatarUrl || '/default-avatar.png'}
        alt="avatar"
        className={styles.avatar}
      />
      <p>
        <strong>Nazwa użytkownika:</strong> {username}
      </p>

      {!isEditing ? (
        <button onClick={() => setIsEditing(true)}>Edytuj awatar</button>
      ) : (
        <Formik
  initialValues={{ avatarUrl: profile.avatarUrl || '', file: null }}
  enableReinitialize
  onSubmit={async (values, { setSubmitting }) => {
    try {
      const token = keycloak.token;

      let avatarUrl = values.avatarUrl;

      // Jeśli wybrano plik, to uploaduj do Cloudinary
      if (values.file) {
        avatarUrl = await uploadAvatar(values.file, token);
      }

      const response = await api.post(
        '/api/users/me/avatar',
        { avatarUrl },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setProfile(response.data);
      setIsEditing(false);
    } catch (err) {
      console.error('Błąd aktualizacji awatara:', err);
    } finally {
      setSubmitting(false);
    }
  }}
>
  {({ isSubmitting, setFieldValue }) => (
    <Form className={styles.profileForm}>
      <label>
        Avatar URL (opcjonalnie):
        <Field type="text" name="avatarUrl" />
      </label>

      <label>
        Lub wybierz plik:
        <input
          type="file"
          accept="image/*"
          onChange={(event) =>
            setFieldValue('file', event.currentTarget.files[0])
          }
        />
      </label>

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Zapisywanie...' : 'Zapisz'}
      </button>
      <button type="button" onClick={() => setIsEditing(false)}>
        Anuluj
      </button>
    </Form>
  )}
</Formik>
      )}
    </div>
  );
}