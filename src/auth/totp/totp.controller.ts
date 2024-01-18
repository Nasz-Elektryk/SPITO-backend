import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { TotpService } from './totp.service';
import { AuthGuard } from '@nestjs/passport';
import { JwtAuthDto } from '../dto/jwt-auth.dto';
import { GetUser } from '../decorator/getUser.decorator';
import { AuthService } from '../auth.service';
import { TotpDto } from '../dto';
import { ConfirmTotpDto } from '../dto';

@Controller('auth/totp')
export class TotpController {
  constructor(
    private readonly totpService: TotpService,
    private readonly authService: AuthService,
  ) {}

  @UseGuards(AuthGuard('jwt'))
  @Get('code')
  async getQrCodeUrl(): Promise<{ url: string | undefined }> {
    return this.totpService.getQrCodeUrl();
  }

  @HttpCode(HttpStatus.OK)
  @Post('verify')
  async verifyTotpCode(@Body() dto: TotpDto) {
    const jwt = await this.totpService.verify(dto.email, dto.code);
    return {
      token: jwt,
      userInfo: await this.authService.getUserPublicInfo(dto.email),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @HttpCode(HttpStatus.NO_CONTENT)
  @Patch('confirm')
  async enableTotpCode(
    @Body() dto: ConfirmTotpDto,
    @GetUser() user: JwtAuthDto,
  ): Promise<void> {
    await this.totpService.enable(user.userId, dto.secret, dto.code);
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('is-enabled')
  async is2faEnabled(
    @GetUser() user: JwtAuthDto,
  ): Promise<{ is2faEnabled: boolean }> {
    return {
      is2faEnabled: await this.totpService.is2faEnabled(user.userId),
    };
  }

  @UseGuards(AuthGuard('jwt'))
  @Patch('remove')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove2FA(@GetUser() user: JwtAuthDto) {
    await this.totpService.remove2FA(user.userId);
  }
}
