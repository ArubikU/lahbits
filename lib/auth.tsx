"use client"
import { poster } from '@/hooks/use-api';
import { cookies } from 'isomorphic-next/headers';
import { redirect } from "next/navigation";
import { useEffect, useState } from "react";

export function requireAuth() {
  //check if sessionId is in localStorage
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);
  useEffect(() => {
  const searchParams = new URLSearchParams(window.location.search);
  const oauth = searchParams.get("oauth")
    let toUpdate = false
    let id = localStorage.getItem("sessionId")
    let exp = localStorage.getItem("sessionExpiry")
    if(!id){
      try{
        const e = cookies()
        
        if(e.has("sessionId")){
          id = e.get("sessionId")
        }

      }catch(e){}
      toUpdate = true
    }
    if(!exp){
      try{
        const e = cookies()
        
        if(e.has("sessionExpiry")){
          exp = e.get("sessionExpiry")
        }

      }catch(e){}
      toUpdate = true
    }
    if(oauth==="true"){
      //get se and expiry from the url
      const se = searchParams.get("se")
      const expi = searchParams.get("expiry")
      if(se){
        id = se
      }
      if(exp){
        exp = expi
      }
      //remove the parameters from the url
      const newUrl = window.location.protocol + "//" + window.location.host + window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }
    if(!id){
      redirect("/auth?stage=login")
    }
    //parse the expiry date
    if(exp){
      const date = new Date(exp)
      const now = new Date()
      if(date < now){
        redirect("/auth?stage=login")
      }
    }
    setSessionId(id)
    setExpiry(exp)

    if(toUpdate){
      //update the localStorage
      localStorage.setItem("sessionId", id)
      localStorage.setItem("sessionExpiry", exp || "")
      const cook =  cookies()
      cook.set("sessionId", id)
      if(exp){
        cook.set("sessionExpiry", exp)
      }
    }
  }
  , []);


  return sessionId;
}

export function verifyAuth(): boolean {
  //check if sessionId is in localStorage
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [expiry, setExpiry] = useState<string | null>(null);
  useEffect(() => {
    let id = localStorage.getItem("sessionId")
    let exp = localStorage.getItem("sessionExpiry")
    if(!id){
      try{
        const e = cookies()
        
        if(e.has("sessionId")){
          id = e.get("sessionId")
        }

      }catch(e){}
    }
    if(!exp){
      try{
        const e = cookies()
        
        if(e.has("sessionExpiry")){
          exp = e.get("sessionExpiry")
        }

      }catch(e){}
    }
    if(!id){



      return
    }

    if(exp){
      const date = new Date(exp)
      const now = new Date()
      if(date < now){
        return
      }
    }
    setSessionId(id)
  }
  , []);
  return !!sessionId;
}

export function clearAuth() {

  const cook =  cookies()
    //get the sessionId from localStorage
    let id = localStorage.getItem("sessionId")
    if(!id){
      try{
        
        if(cook.has("sessionId")){
          id = cook.get("sessionId")
        }

      }catch(e){}
    }
    poster("/api/auth/logout", {objectbody:{sessionId: id}})
  localStorage.removeItem("sessionId")
  cook.delete("sessionId")
}

export function setupAuth(result: {session:{id: string,expiry?: string}}) {
  if(!result.session.id) return
  console.log("setting up auth", result)
  localStorage.setItem("sessionId",result.session.id)
  const cook =  cookies()
  cook.set("sessionId", result.session.id)
  //save on localstorage the expiry date of the session

  if(result.session.expiry){
    localStorage.setItem("sessionExpiry",result.session.expiry)
    cook.set("sessionExpiry", result.session.expiry)
  }
}