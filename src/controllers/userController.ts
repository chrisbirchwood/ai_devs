import { Request, Response } from "express";
import { User } from "../types/user";
import { supabase } from "../config/supabase";

export class UserController {
  public getAllUsers = async (req: Request, res: Response) => {
    try {
      const { data, error } = await supabase.from("users").select("*");
      if (error) throw error;
      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public getUserById = async (req: Request, res: Response) => {
    try {
      const { id } = req.params;
      const { data, error } = await supabase
        .from("users")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      if (!data)
        return res.status(404).json({ message: "Nie znaleziono użytkownika" });

      res.json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };

  public createUser = async (req: Request, res: Response) => {
    try {
      const newUser: User = req.body;
      const { data, error } = await supabase
        .from("users")
        .insert([newUser])
        .select()
        .single();

      if (error) throw error;
      res.status(201).json(data);
    } catch (error: any) {
      res.status(500).json({ message: error.message });
    }
  };
}
