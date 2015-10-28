﻿using FirstREST.Lib_Primavera.Model;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;

namespace FirstREST.Controllers
{
    using Lib_Primavera;

    public class MaleToFemaleRatioController : ApiController
    {
        //GET api/FemaleToMaleRatio
        public GenderCounter Get(DateTime initialDate, DateTime finalDate)
        {
            return PriIntegration.GetGenderCounting(initialDate, finalDate);
        }
    }
}
