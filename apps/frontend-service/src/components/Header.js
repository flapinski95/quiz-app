"use client"
import { useRouter } from "next/navigation";
import styles from "../app/page.module.css"
export default function Header() {
  const router = useRouter()
  return (
    <header className={styles.header}>
      <div>quiz-app</div>
      <button onClick={() => router.push("/profile") }>Profile</button>
    </header>
  );
}