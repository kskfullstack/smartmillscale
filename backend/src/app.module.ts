import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { PemasokModule } from './pemasok/pemasok.module';
import { SopirModule } from './sopir/sopir.module';
import { KendaraanModule } from './kendaraan/kendaraan.module';
import { TimbanganModule } from './timbangan/timbangan.module';
import { GradingModule } from './grading/grading.module';
import { ScaleModule } from './scale/scale.module';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './user/user.module';
import { RoleModule } from './role/role.module';
import { CompanyModule } from './company/company.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    CompanyModule,
    PemasokModule,
    SopirModule,
    KendaraanModule,
    TimbanganModule,
    GradingModule,
    ScaleModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}