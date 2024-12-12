import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
// import { JwtService } from '@nestjs/jwt';

@Module({
  imports: [
    JwtModule.register({
      secret: process.env.AUTH_SECRET_KEY, // Use environment variables
      // signOptions: { expiresIn: '1h' },
    }),
  ],
  exports: [JwtModule], // Make available for other modules
})
export class AuthModule {}
