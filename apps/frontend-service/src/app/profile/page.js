'use client';

import { useEffect, useState } from 'react';
import { useKeycloakContext } from '@/context/KeycloakContext';
import { useRouter } from 'next/navigation';
import { Formik, Form, Field } from 'formik';
import styles from '../page.module.css';
import api from '../../lib/axios';
import uploadAvatar from '../../utils/uploadAvatar';

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

  useEffect(() => {
    const fetchProfile = async () => {
      console.log(keycloak.token);
      console.log(keycloak.tokenParsed)
      
      try {
        const response = await api.get('/api/users/me', {
          headers: {
            Authorization: `Bearer ${keycloak.token}`,
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

  const handleAvatarUpdate = async (values, { setSubmitting }) => {
    try {
      let avatarUrl = values.avatarUrl;
      console.log(keycloak.token);
      if (values.file) {
        avatarUrl = await uploadAvatar(values.file); 
      }

      const response = await api.post(
        '/api/users/me/avatar',
        { avatarUrl },
        { headers: {
          Authorization: `Bearer ${keycloak.token}`,
        }}
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

  const username = profile.username || keycloak.tokenParsed?.preferred_username || 'Nieznany';

  return (
    <div className={styles.profileContainer}>
      <h2>Profil użytkownika</h2>
      <img
        src={profile.avatarUrl || '/default-avatar.png'}
        alt="avatar"
        className={styles.avatar}
      />
      <p><strong>Nazwa użytkownika:</strong> {username}</p>

      {!isEditing ? (
        <button onClick={() => setIsEditing(true)}>Edytuj awatar</button>
      ) : (
        <Formik
          initialValues={{ avatarUrl: profile.avatarUrl || '', file: null }}
          enableReinitialize
          onSubmit={handleAvatarUpdate}
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