import { Controller, Get, Post, Body, Patch, Param, Delete, Query } from '@nestjs/common';
import { ResumesService } from './resumes.service';
import { CreateUserCvDto } from './dto/create-resume.dto';
import { UpdateResumeDto } from './dto/update-resume.dto';
import { IUser } from 'src/users/users.interface';
import { ResponseMessage, User } from 'src/decorator/customize';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('resumes')
@Controller('resumes')
export class ResumesController {
  constructor(private readonly resumesService: ResumesService) {}

  @Post()
  @ResponseMessage('Create a new resume')
  create(@Body() createUserCvDto: CreateUserCvDto, @User() user: IUser) {
    return this.resumesService.create(createUserCvDto, user);
  }

  @Get()
  @ResponseMessage('Fetch list Resume with paginate')
  findAll(@Query('current') currentPage: string, @Query('pageSize') limit: string, @Query() qs: string) {
    return this.resumesService.findAll(+currentPage, +limit, qs);
  }

  @Get(':id')
  @ResponseMessage('Fetch a Resume by id')
  findOne(@Param('id') id: string) {
    return this.resumesService.findOne(id);
  }

  @Patch(':id')
  @ResponseMessage('Update status resume')
  updateStatus(@Param('id') id: string, @Body('status') status: string, @User() user: IUser) {
    return this.resumesService.update(id, status, user);
  }

  @Delete(':id')
  @ResponseMessage('Delete a Resume by id')
  remove(@Param('id') id: string, @User() user: IUser) {
    return this.resumesService.remove(id, user);
  }

  @Post('by-user')
  @ResponseMessage('Get Resume by user')
  getResumeByUser(@User() user: IUser) {
    return this.resumesService.findByUser(user);
  }
}
