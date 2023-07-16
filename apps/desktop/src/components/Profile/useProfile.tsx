import { useState, useRef, useEffect } from "react";
import { useClickOutside } from "../../hooks/useClickOutside";
import { usePreviousValue } from "../../hooks/usePreviousValue";
import useStore from "../../Stores/sessionStore";
import { supabase } from "../../lib/supabaseClient";
import { useNavigate } from "react-router-dom";

export const useProfile = () => {
  const navigate = useNavigate();
  const ref = useRef(null);
  const [isOpen, setIsOpen] = useState(false);
  const [shouldRender, setShouldRender] = useState(isOpen);
  const previousState = usePreviousValue({ open });
  // const userProfile = useStore();

  const handleSignout = async () => {
    // await supabase.auth.signOut().then(({ error }) => {
    //   if (error) {
    //     console.log(error);
    //     return;
    //   } else {
    //     // @ts-ignore-next-line

    //     userProfile.invalidateCurrentSession();
    //     navigate("/");
    //   }
    // });
  };

  useClickOutside(ref, () => {
    if (isOpen) {
      setIsOpen(false);
    }
  });

  const expandProfile = () => {
    setIsOpen(!isOpen);
  };

  useEffect(() => {
    // initialize the notification panel to open
    if (isOpen) {
      setShouldRender(true);
    }
  }, [isOpen]);

  useEffect(() => {
    setTimeout(() => {
      // @ts-ignore-next-line

      if (previousState?.open && !isOpen) {
        setShouldRender(false);
      }
    }, 250);
  }, [isOpen]);

  return {
    ref,
    isOpen,
    shouldRender,
    expandProfile,
    // userProfile,
    handleSignout,
    setShouldRender,
  };
};
