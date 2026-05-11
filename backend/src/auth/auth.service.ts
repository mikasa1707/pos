import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Utilisateur } from '../pos/utilisateurs/entities/utilisateur.entity';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(Utilisateur)
    private usersRepo: Repository<Utilisateur>,
    private jwtService: JwtService,
  ) {}

  async login(email: string, mot_de_passe: string) {
    const user = await this.usersRepo.findOne({
      where: { email, actif: true },
    });

    if (!user) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const ok = await bcrypt.compare(mot_de_passe, user.mot_de_passe);

    if (!ok) {
      throw new UnauthorizedException('Identifiants incorrects');
    }

    const payload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      nom: user.nom,
    };

    return {
      access_token: await this.jwtService.signAsync(payload),
      user: {
        id: user.id,
        nom: user.nom,
        email: user.email,
        role: user.role,
      },
    };
  }
}