import { Body, Controller, Get, Post, Res, HttpStatus, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { UserService } from '../services/user.service';
import { CreateUserDto } from '../dto/create-user.dto';
import { LoginUserDto } from '../dto/login-user.dto';
import { UpdateProfileDto } from "../dto/update-profile.dto"
import { AuthGuard } from "../guards/jwt-auth.guard"

@Controller()
export class UserController {
  constructor(private readonly userService: UserService) { }

  /**
   * Handles user registration.
   * @param createUserDto - The data for creating a new user.
   * @param res - The HTTP response object.
   * @returns HTTP response with the result of the registration process.
   */
  @Post('signUp')
  async signup(
    @Body() createUserDto: CreateUserDto,
    @Res() res: Response,
  ): Promise<Response> {
    try {
      const validationErrors = await this.userService.validateCreateUser(createUserDto);

      if (validationErrors.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "validation failed", error: validationErrors })
      }

      const isEmailExist = await this.userService.findByEmail(createUserDto.email);

      if (isEmailExist) {
        return res.status(HttpStatus.CONFLICT).json({ error: "User with this email already present" })
      }

      const isPhoneExist = await this.userService.findByphone(createUserDto.phone_no)

      if (isPhoneExist) {
        return res.status(HttpStatus.CONFLICT).json({ error: "User with this phone number already present" })
      }

      await this.userService.create(createUserDto);

      return res.status(HttpStatus.CREATED).json({ message: "User created successfully" })
    } catch (error) {
      console.log(error)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Handles user login.
   * @param loginUserDto - The data for user login.
   * @param res - The HTTP response object.
   * @returns HTTP response with the result of the login process.
   */
  @Post('login')
  async login(@Body() loginUserDto: LoginUserDto, @Res() res: Response): Promise<Response> {
    try {
      const validationErrors = await this.userService.validateLoginUser(loginUserDto);

      if (validationErrors.length > 0) {
        return res.status(HttpStatus.BAD_REQUEST).json({ message: "validation failed", error: validationErrors })
      }

      const user: any = await this.userService.findByEmail(loginUserDto.email);

      if (!user) {
        return res.status(HttpStatus.NOT_FOUND).json({ error: "Invalid Credentials" })
      }

      const checkPassword = await this.userService.deCryptPassword(loginUserDto.password, user.password)

      if (!checkPassword) {
        return res.status(HttpStatus.UNAUTHORIZED).json({ error: "Invalid Credentials" })
      }

      const token = await this.userService.login(user._id);

      return res.status(HttpStatus.OK).json({ message: "login successfully", access_token: token })

    } catch (err) {
      console.log(err)
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ error: 'Internal Server Error' })
    }
  }

  /**
   * Updates user profile.
   * @param updateProfiledto - The data for updating user profile.
   * @param res - The HTTP response object.
   * @returns HTTP response with the result of the profile update process.
   */
  @UseGuards(AuthGuard)
  @Post('updateProfile')
  async updateProfile(@Body() updateProfiledto:UpdateProfileDto,@Res() res:Response):Promise<Response> {
    console.log(updateProfiledto)
    const validationErrors = await this.userService.validateUpdateProfile(updateProfiledto);

    if (validationErrors.length > 0) {
      return res.status(HttpStatus.BAD_REQUEST).json({ message: "validation failed", error: validationErrors })
    }
    await this.userService.updateProfile(updateProfiledto)
    return res.status(HttpStatus.CREATED).json({ message: "Profile Updated Successfully" })
  }
}
