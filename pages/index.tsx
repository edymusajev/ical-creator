import type { NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import { useState } from "react";
import styles from "../styles/Home.module.css";

const Home: NextPage = () => {
  const handleClick = async () => {
    // send a post request to /api/event
    const response = await fetch("/api/event", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        summary: "Final Call",
        description: "Casting for the New James Bond Movie",
        organizer_email: "johndoe@apyhub.com",
        attendees_emails: ["mark@apyhub.com"],
        location: "US",
        start_time: "08:00",
        end_time: "09:00",
        meeting_date: "30-11-2022",
        recurring: true,
        recurrence: {
          frequency: "WEEKLY",
          count: 2,
        },
      }),
    });

    const blob = await response.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "event.ics";
    a.click();
  };

  return (
    <div className={styles.container}>
      <button onClick={handleClick}>Download</button>
    </div>
  );
};

export default Home;
